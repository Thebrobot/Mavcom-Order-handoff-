# Phase A — Design checklist (do before building the webhook workflow)

Complete this in order. Check boxes when done.

---

## A1 — Confirm where this lives

- [ ] I am in the correct **HighLevel sub-account (Location)** where Mavcom deals should land.
- [ ] I have **admin or settings** access to create **Custom Fields** and **Workflows**.

**Location name (write it here):** _________________________________

---

## A2 — Lock the “one contact” rule (30 seconds)

**Decision (write one sentence):**

> Every form submission creates or updates **one Contact** using the **decision-maker email** as the main key. All deal data attaches to that contact (custom fields + notes).

- [ ] This rule is agreed by whoever owns CRM data (sales / ops / RevOps).

**Who resolves conflicts if the same email submits twice?** (e.g. “Always update the same contact”)

_________________________________________________________________

---

## A3 — Map standard Contact fields (no custom field needed)

The app sends `contact.firstName`, `contact.lastName`, `contact.phone`, `contact.email`.

In your workflow you will map these to **built-in** Contact fields:

| App field | GHL standard field |
|-----------|---------------------|
| `contact.email` | Email |
| `contact.phone` | Phone |
| `contact.firstName` | First Name |
| `contact.lastName` | Last Name |

**Business name:** The app sends `business.legalName`. In GHL that usually maps to **Company Name** on the contact (or a custom field if you prefer legal name separate).

- [ ] We will use **Company Name** for `business.legalName`: **Yes** / **No** (if No, create custom field in A4).

---

## A4 — Create Contact custom fields (in HighLevel UI)

**Path:** `Settings` → `Custom Fields` → select **Contact** → `Add Field`

Create **only** what you need for reporting and handoffs. Use the **`Mavcom `** prefix (space after Mavcom, no dash). Full list: **`docs/CUSTOM-FIELDS.md`**.

Legacy optional rows if you are **not** using native Company fields (usually skip):

| # | Field name (label in GHL) | Type | Filled from webhook (path) |
|---|---------------------------|------|------------------------------|
| 1 | Mavcom Legal business name | Text | `business.legalName` *(skip if using Company Name only)* |
| 2 | Mavcom Full address | Large Text | `business.address` |
| 3 | Mavcom Industry | Text | `business.industry` |
| 4 | Mavcom Business website | Text | `business.website` |
| 5 | Mavcom Main business phone | Phone | `business.phone` |

**Confirmations** (`confirmations.*` booleans) — either:

- [ ] Three **checkbox** custom fields (see `CUSTOM-FIELDS.md`), **or**
- [ ] One **Large text** field **Mavcom Confirmations** with Yes/No per line from workflow.

- [ ] All fields above that you need are **created** in GHL.

---

## A5 — Duplicate / merge rule

**Write your rule in one line:**

Example: *“If a Contact exists with the same email as `contact.email`, update that contact and append a new internal Note. If not, create a new Contact.”*

Your rule:

_________________________________________________________________

_________________________________________________________________

- [ ] This matches how ops handles repeat submissions from the same client.

---

## A6 — Tags (optional but recommended)

Decide tags to apply on successful webhook (you’ll add these in Phase B).

Suggested:

- `Mavcom Deal submitted`
- `Source Mavcom form`

**Your tags:**

1. _________________________________
2. _________________________________

---

## A7 — Stop point

**Phase A is done when:**

- [ ] Custom fields exist (or you consciously skipped rows and documented why).
- [ ] Standard field mapping for contact + company is decided.
- [ ] Duplicate rule is written down.
- [ ] Tags are chosen (or “none” is documented).

**Next:** Build the **Inbound Webhook** workflow and map each JSON path to these fields (`DEAL-WEBHOOK-RUNBOOK.md`).
