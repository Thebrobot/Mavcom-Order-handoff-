# Mavcom deal form → HighLevel: runbook

Use this checklist so webhook submissions, contacts, and custom fields stay reliable when multiple reps use the tool.

**Phase B (step-by-step workflow build):** see **`docs/PHASE-B-WEBHOOK-WORKFLOW.md`** — company → contact → link → Mavcom fields → note → tags → notify, plus sample JSON for testing.

---

## 1. Decide the single source of truth

| Data | Where it lives in GHL |
|------|------------------------|
| **Contact (person)** | Standard **Contact** fields + **decision-maker email/phone** as the primary lookup key |
| **Company / deal context** | **Business name** on contact or **Company** record (if you use Companies) |
| **Line items & totals** | **Large text** custom field with JSON **or** a formatted **Note** (recommended: both — see §4) |
| **Money / dates** | **Custom fields** (numbers/dates) or parsed from JSON in automation |

**Rule:** One **Contact** per submission (decision-maker). Everything else attaches to that contact so nothing fragments across duplicate records.

---

## 2. Create custom fields first (before building the workflow)

In **Settings → Custom Fields** (Contacts), create fields you will map from the webhook. **Suggested Contact field labels:** see **`docs/CUSTOM-FIELDS.md`** (prefix **`Mavcom `**, no dash).

**Suggested minimum (examples; adjust labels to your org):**

| Field purpose | Suggested type | Maps from JSON path |
|---------------|----------------|---------------------|
| Deal payload (full JSON) | Large text | Entire body `JSON.stringify` from workflow or single field `payload` if you add it later |
| Legal business name | Text | `business.legalName` |
| Business address | Large text | `business.address` |
| Industry | Text | `business.industry` |
| Website | Text | `business.website` |
| Main business phone | Phone | `business.phone` |
| Expected monthly billing | Number | `totals.expectedMonthlyBilling` |
| Total setup fees | Number | `totals.totalSetupFees` |
| Sale date | Date | `billing.saleDate` |
| Billing type | Text | `billing.billingType` (values: `charge_today`, `att_port`) |
| CC collected | Text | `billing.ccCollected` |
| Est. first charge date | Date | `billing.estimatedChargeDate` |
| Rep name | Text | `rep.name` |
| Rep email | Text | `rep.email` |
| Agreement signed date | Date | `agreement.signedDate` |
| Service start date | Date | `agreement.serviceStartDate` |
| Internal notes | Large text | `notes` |
| Deal line items (human-readable) | Large text | **Built in workflow** from `products` array (see §5) |
| Products JSON (optional) | Large text | `productsJson` from webhook *(app sends stringified line items)* |

**Why duplicate JSON + readable note?** Automations and reporting are easier on structured fields; humans can read a formatted note without opening JSON.

---

## 3. Webhook workflow (Inbound Webhook trigger)

1. **Automations → Workflows → Create** workflow.
2. **Trigger:** **Inbound Webhook** (or your sub-account’s equivalent name).
3. **Copy the webhook URL** — this is what you put in `.env` as `VITE_SUBMIT_WEBHOOK_URL`.
4. **Method:** `POST`. **Body:** JSON (your app sends `Content-Type: application/json`).

**Security**

- Treat the URL like a **secret** (anyone with the URL can POST). Rotate if leaked.
- Restrict who can see the workflow and edit the trigger.
- **Vite note:** `VITE_*` values are **visible in the browser bundle**. For high-risk deals, consider a **serverless proxy** that holds the real URL server-side (optional hardening).

---

## 4. Workflow steps (recommended order)

### Step A — Validate required fields

Add a **Filter** or **If / Else** branch:

- `contact.email` must exist and look like an email.
- Optionally require `business.legalName`.

If validation fails → **internal notification** (Slack/email) with raw payload + **do not** create a half-empty contact (or tag as `FAILED_VALIDATION`).

### Step B — Find or create contact

- **Lookup** contact by **email** (`contact.email`).
- **If found:** update contact (and optionally **add note** “New Mavcom deal submission” + timestamp).
- **If not found:** **Create contact** with:
  - First name, last name, phone, email from `contact.*`
  - Business name / company as per your GHL setup

**Duplicate prevention:** Email-based lookup is the main lever. **Phone** is a secondary match only if you’re sure your data is consistent.

### Step C — Map custom fields

Map from the webhook payload keys (nested paths as your workflow builder allows):

- `business.*`, `billing.*`, `rep.*`, `agreement.*`, `totals.*`, `notes`

If your builder only flattens **one level**, use **Custom Code** or **Formatter** steps to set nested values, or add a **“Copy entire JSON to one field”** step for backup and parse later.

### Step D — Line items (products + totals)

**Option 1 (simplest):** Add a **Note** on the contact:

- Title: `Mavcom deal line items`
- Body: loop `products[]` and print each line: `productLabel`, `customLabel`, `monthlyAmount`, `setupFee`, `contractTermMonths`

**Option 2:** Map **`productsJson`** from the webhook into **Mavcom Products JSON** (the app sends this as a string; do not map raw `products` to a text field).

**Option 3:** **Opportunity** pipeline — create/update opportunity per deal with amount = `totals.expectedMonthlyBilling` or custom logic (requires pipeline design).

### Step E — Tagging & pipeline

- Add tags: e.g. `Mavcom Deal submitted`, `Source Mavcom form` (`source` from payload is `maverick-deal-form`).
- Move **Opportunity** or trigger **internal workflow** for fulfillment.

### Step F — Notifications

- Email/Slack **internal team** with link to **contact record** + key numbers (`totals.expectedMonthlyBilling`, `totals.totalSetupFees`).

### Step G — Error path

If any step fails:

- **Notify** ops with `submittedAt` + email + raw payload (from webhook logs or stored error field).
- **Do not** show success to the user from GHL (that’s the app’s job). **Monitor** failed workflow runs in GHL.

---

## 5. JSON reference (what the app sends)

Top-level keys:

- `source` — always `"maverick-deal-form"`
- `submittedAt` — ISO timestamp
- `contact` — `firstName`, `lastName`, `phone`, `email`
- `business` — `legalName`, `address`, `industry`, `website`, `phone`
- `products` — array of `{ productId, productLabel, customLabel, monthlyAmount, setupFee, contractTermMonths }`
- `totals` — `expectedMonthlyBilling` (number), `totalSetupFees` (number)
- `billing` — `saleDate`, `billingType`, `ccCollected`, `estimatedChargeDate`
- `rep` — `name`, `email`
- `agreement` — `signedDate`, `serviceStartDate`
- `notes` — string
- `confirmations` — `agreementSigned`, `payment`, `onboarding` (booleans)

---

## 6. Testing (before go-live)

1. **Staging** sub-account or test contact first.
2. Use **Postman** or **curl** to `POST` the same JSON shape to the webhook URL (copy sample from browser DevTools → Network on a test submit).
3. Confirm **contact** created/updated, **custom fields** filled, **note** created.
4. Test **duplicate email** — second submit should **update** or **merge** per your rules.
5. Test **invalid** body (missing email) — should hit your **error** branch, not silent failure.
6. **Production deploy:** set `VITE_SUBMIT_WEBHOOK_URL` in hosting env, **rebuild** the site.

---

## 7. CORS and “Failed to fetch”

Browsers may block `fetch` to `leadconnectorhq.com` from your domain.

- If users see **CORS / network** error on submit: use a **proxy** (Netlify/Vercel serverless) that forwards POST to the same GHL URL, and point `VITE_SUBMIT_WEBHOOK_URL` at **your** proxy URL.

---

## 8. Ongoing operations

- **Weekly:** Review workflow **execution history** for failures.
- **When form fields change:** Update this workflow mappings and `buildWebhookPayload` in code (keep in sync).
- **Rotate** webhook URL if workflow is duplicated or URL leaked.

---

## 9. App configuration (recap)

```bash
# maverick-deal-form/.env
VITE_SUBMIT_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/...
```

Then `npm run build` and deploy. **Document** who owns the URL and which workflow it triggers.
