# Phase B — Build the Inbound Webhook workflow (step-by-step)

Follow in order. Your **Contact** custom fields use liquid keys like `{{ contact.mavcom_sale_date }}` — in **workflow actions**, map from the **inbound JSON** paths below (GHL may show them as `body.contact.email`, `data.contact.email`, or similar — **use whatever your trigger exposes** after you run a test).

---

## B0 — Connect the app to this webhook (do first or right after B1)

1. In **Automations → Workflows**, create a new workflow.
2. Trigger: **Inbound Webhook** → **Generate / copy URL**.
3. In your project, **`maverick-deal-form/.env`**:
   ```bash
   VITE_SUBMIT_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/...
   ```
4. Run **`npm run build`** and deploy (or `npm run dev` locally).

---

## B1 — Inspect the payload shape (one test)

1. Use **“Test webhook”** or send a **POST** from Postman with **`Content-Type: application/json`**.
2. Paste the **sample JSON** at the bottom of this doc.
3. In the workflow run log / trigger output, **note the exact paths** (e.g. `contact.email` vs `body.contact.email`). You will use those paths in every mapping below.

---

## B2 — Validation (recommended)

Add a **Filter** or **If / Else** branch immediately after the trigger:

- **Pass** if `contact.email` exists and contains `@` (using your trigger’s path).
- **Fail** branch: internal notification (Slack/email) “Mavcom webhook validation failed” + include raw payload; **stop** or tag — do not create junk records.

---

## B3 — Company (find or create) → update business fields

**Goal:** One **Company** per `business.legalName`.

1. **Find / Search Company** where name matches **`business.legalName`** (normalize if your builder allows: trim spaces).
2. **If not found → Create Company** with:
   - Name ← `business.legalName`
   - Address / website / phone / industry ← from `business.address`, `business.website`, `business.phone`, `business.industry` (map to **native Company** fields your account has).
3. **If found → Update Company** with the same fields so data stays current.

**Save the Company ID** from this step for B5.

---

## B4 — Contact (find or create) → update person fields

**Goal:** One **Contact** per `contact.email` (decision-maker).

1. **Find Contact** by email = **`contact.email`**.
2. **If not found → Create Contact** with:
   - First name ← `contact.firstName`
   - Last name ← `contact.lastName`
   - Email ← `contact.email`
   - Phone ← `contact.phone`
3. **If found → Update** the same fields.

**Save the Contact ID** for B5–B7.

---

## B5 — Link Contact to Company

Use your GHL action: **Associate contact to company** / **Add to company** / **Set primary company** (name varies).

- Contact ← from B4  
- Company ← from B3  

---

## B6 — Map Mavcom custom fields (Contact)

Use **Update Contact** / **Set custom field** actions. Map **from JSON** → **to your field** (internal keys are `mavcom_*` as in Custom Fields).

| JSON path | Your field (label) | Notes |
|-----------|----------------------|--------|
| `totals.expectedMonthlyBilling` | Mavcom Expected Monthly Billing | Number |
| `totals.totalSetupFees` | Mavcom Total Setup Fees | Number |
| `billing.saleDate` | Mavcom Sale Date | Date (ISO string from app) |
| `billing.billingType` | Mavcom Billing Type | Text |
| `billing.ccCollected` | Mavcom CC Collected | Text |
| `billing.estimatedChargeDate` | Mavcom Est. First Charge Date | Date |
| `rep.name` | Mavcom Rep Name | Text |
| `rep.email` | Mavcom Rep Email | Text |
| `agreement.signedDate` | Mavcom Agreement Signed Date | Date |
| `agreement.serviceStartDate` | Mavcom Service Start Date | Date |
| `notes` | Mavcom Deal Notes | Large text |
| `confirmations.agreementSigned` | Mavcom Agreement Confirmed | Checkbox |
| `confirmations.payment` | Mavcom Payment Confirmed | Checkbox |
| `confirmations.onboarding` | Mavcom Onboarding Confirmed | Checkbox |
| `submittedAt` | Mavcom Submitted At | Text |
| `productsJson` | Mavcom Products JSON | **Large text** — the app sends this as a **string** (use this path, not raw `products`) |

**Products:** The payload includes **`products`** (array) and **`productsJson`** (same data as a JSON string). Map **`productsJson`** → **Mavcom Products JSON** in GHL (e.g. `{{inboundWebhookRequest.productsJson}}`) to avoid `[object Object]`.

Optional: add a **Note** (B7) with human-readable line items from `products[]`.

---

## B7 — Internal note (line items for humans)

**Add Note** on the **Contact** (from B4):

- **Title:** `Mavcom deal line items`
- **Body:** Loop `products[]` and print each line, e.g.  
  `productLabel` / `customLabel`, `monthlyAmount`, `setupFee`, `contractTermMonths`

---

## B8 — Tags

Add tags, for example:

- `Mavcom Deal submitted`
- `Source Mavcom form`

(Optionally tag with `source` value `maverick-deal-form` from JSON if you use tag automation.)

---

## B9 — Internal notification

Send **email or Slack** to ops with:

- Link to **Contact** record  
- Company name (`business.legalName`)  
- `totals.expectedMonthlyBilling` and `totals.totalSetupFees`  

---

## B10 — Error path

If any step fails, use workflow **error** or a parallel branch to notify ops. Check **workflow execution history** weekly.

---

## B11 — End-to-end test

1. Deploy site with **`VITE_SUBMIT_WEBHOOK_URL`** set.
2. Submit the **full form** from the **live** URL with a **test** email.
3. Confirm: Company, Contact, link, all Mavcom fields, note, tags.
4. Submit **again** with the **same email** — confirm **update** behavior matches your Phase A rule.

---

## B12 — If the browser shows CORS / “Failed to fetch”

The app posts from the browser. If blocked:

- Add a **serverless proxy** (Netlify/Vercel function) that forwards `POST` + JSON to the same GHL URL.
- Set **`VITE_SUBMIT_WEBHOOK_URL`** to **your** proxy URL.

---

## Sample JSON (for Postman / webhook test)

```json
{
  "source": "maverick-deal-form",
  "submittedAt": "2026-03-23T14:00:00.000Z",
  "contact": {
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "5551234567",
    "email": "jane@testcompany.com"
  },
  "business": {
    "legalName": "Test Company LLC",
    "address": "123 Main St, Austin, TX 78701",
    "industry": "Healthcare",
    "website": "https://testcompany.com",
    "phone": "5559876543"
  },
  "products": [
    {
      "productId": "brobot-one",
      "productLabel": "Brobot One (voice, messaging & CRM)",
      "customLabel": "",
      "monthlyAmount": "299",
      "setupFee": "500",
      "contractTermMonths": "36"
    }
  ],
  "productsJson": "[{\"productId\":\"brobot-one\",\"productLabel\":\"Brobot One (voice, messaging & CRM)\",\"customLabel\":\"\",\"monthlyAmount\":\"299\",\"setupFee\":\"500\",\"contractTermMonths\":\"36\"}]",
  "totals": {
    "expectedMonthlyBilling": 299,
    "totalSetupFees": 500
  },
  "billing": {
    "saleDate": "2026-03-20",
    "billingType": "charge_today",
    "ccCollected": "yes",
    "estimatedChargeDate": "2026-03-25"
  },
  "rep": {
    "name": "Rep Name",
    "email": "rep@example.com"
  },
  "agreement": {
    "signedDate": "2026-03-18",
    "serviceStartDate": "2026-04-01"
  },
  "notes": "Test note",
  "confirmations": {
    "agreementSigned": true,
    "payment": true,
    "onboarding": true
  }
}
```

---

## Quick reference: JSON paths (from the app)

| Path | Type |
|------|------|
| `source` | string |
| `submittedAt` | ISO string |
| `contact.firstName` | string |
| `contact.lastName` | string |
| `contact.phone` | string |
| `contact.email` | string |
| `business.legalName` | string |
| `business.address` | string |
| `business.industry` | string |
| `business.website` | string |
| `business.phone` | string |
| `products` | array |
| `productsJson` | string (JSON text of line items — use for Mavcom Products JSON) |
| `totals.expectedMonthlyBilling` | number |
| `totals.totalSetupFees` | number |
| `billing.saleDate` | string (YYYY-MM-DD) |
| `billing.billingType` | string |
| `billing.ccCollected` | string |
| `billing.estimatedChargeDate` | string |
| `rep.name` | string |
| `rep.email` | string |
| `agreement.signedDate` | string |
| `agreement.serviceStartDate` | string |
| `notes` | string |
| `confirmations.agreementSigned` | boolean |
| `confirmations.payment` | boolean |
| `confirmations.onboarding` | boolean |

---

When this checklist is green, Phase B is **done**.
