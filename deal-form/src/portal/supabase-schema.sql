-- ============================================================
-- BROBOT SALES PARTNER PORTAL — SUPABASE SCHEMA
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. PROFILES ─────────────────────────────────────────────
-- One row per auth user. Stores the is_admin flag.

create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  full_name   text,
  is_admin    boolean default false,
  created_at  timestamptz default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 2. DEALS ────────────────────────────────────────────────

create table if not exists public.deals (
  id                    uuid primary key default gen_random_uuid(),
  rep_email             text not null,
  rep_name              text,
  client_name           text,
  business_name         text,
  products_json         jsonb,
  total_mrc             numeric,
  plan_mrc              numeric,   -- base plan price (1 device each), used for commission
  total_setup           numeric,
  commission_amount     numeric,   -- v1: plan_mrc × 1; update formula here when tiers are defined
  sale_date             date,
  handoff_complete      boolean default false,
  handoff_completed_at  timestamptz,
  handoff_completed_by  text,      -- email of admin who marked it complete
  submitted_at          timestamptz default now(),
  raw_payload           jsonb      -- full webhook payload for reference
);


-- ── 3. SECURE INSERT FUNCTION ────────────────────────────────
-- Called from the public deal form (anon key) via supabase.rpc().
-- security definer bypasses RLS so the anon client can insert
-- without exposing a blanket INSERT policy on the deals table.
-- NOTE: section 6 below redefines this function with the full column list.
-- You only need to run one of them — run section 6 if starting fresh.

create or replace function public.insert_deal(payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  new_id uuid;
begin
  insert into public.deals (
    rep_email, rep_name, client_name, business_name,
    products_json, total_mrc, plan_mrc, total_setup,
    commission_amount, sale_date, raw_payload
  ) values (
    payload->>'rep_email',
    payload->>'rep_name',
    payload->>'client_name',
    payload->>'business_name',
    payload->'products_json',
    (payload->>'total_mrc')::numeric,
    (payload->>'plan_mrc')::numeric,
    (payload->>'total_setup')::numeric,
    (payload->>'commission_amount')::numeric,
    (payload->>'sale_date')::date,
    payload
  )
  returning id into new_id;

  return new_id;
end;
$$;

-- Grant anon and authenticated roles permission to call the function
grant execute on function public.insert_deal(jsonb) to anon, authenticated;


-- ── 4. ROW LEVEL SECURITY ────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.deals    enable row level security;

-- Profiles: each user manages their own row
create policy "profiles: own row"
  on public.profiles for all
  using (auth.uid() = id);

-- Profiles: admins can read all profiles
create policy "profiles: admin read all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Deals: reps see only their own deals
create policy "deals: rep sees own"
  on public.deals for select
  using (rep_email = auth.jwt() ->> 'email');

-- Deals: admins have full access to all deals
create policy "deals: admin all"
  on public.deals for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );


-- ── 5. COMMISSION & PAYOUT FIELDS (run after initial setup) ─
-- If you've already run the initial schema, run only this block:

alter table public.deals add column if not exists first_payment_date  date;
alter table public.deals add column if not exists payout_date          date;
alter table public.deals add column if not exists commission_paid      boolean default false;
alter table public.deals add column if not exists commission_paid_at   timestamptz;
alter table public.deals add column if not exists commission_paid_by   text;

-- ── 6. COMMISSION RULES & CLOSER FIELDS (run after section 5) ────────────────
-- upfront_commission = flat product amounts + 25% of setup fees
-- monthly_residual   = product commission total × 25% (or 30% after $30K lifetime)
-- closer_name        = which rep on the partner's team closed the deal (optional)

alter table public.deals add column if not exists upfront_commission  numeric;
alter table public.deals add column if not exists monthly_residual    numeric;
alter table public.deals add column if not exists closer_name         text;
alter table public.deals add column if not exists multi_location      boolean default false;
alter table public.deals add column if not exists churned             boolean default false;

-- Update the insert_deal function to accept all current fields.
-- Existing calls without optional fields will still work.
create or replace function public.insert_deal(payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  new_id uuid;
begin
  insert into public.deals (
    rep_email, rep_name, client_name, business_name,
    products_json, total_mrc, plan_mrc, total_setup,
    commission_amount, upfront_commission, monthly_residual,
    closer_name, multi_location, churned, sale_date, raw_payload
  ) values (
    payload->>'rep_email',
    payload->>'rep_name',
    payload->>'client_name',
    payload->>'business_name',
    payload->'products_json',
    (payload->>'total_mrc')::numeric,
    (payload->>'plan_mrc')::numeric,
    (payload->>'total_setup')::numeric,
    (payload->>'commission_amount')::numeric,
    (payload->>'upfront_commission')::numeric,
    (payload->>'monthly_residual')::numeric,
    payload->>'closer_name',
    coalesce((payload->>'multi_location')::boolean, false),
    coalesce((payload->>'churned')::boolean, false),
    (payload->>'sale_date')::date,
    payload
  )
  returning id into new_id;

  return new_id;
end;
$$;


-- ── 7. GRANT AN EXISTING USER ADMIN ACCESS ──────────────────
-- Run this manually for each admin user after they sign up:
--
--   update public.profiles
--   set is_admin = true
--   where email = 'admin@thebrobot.com';
