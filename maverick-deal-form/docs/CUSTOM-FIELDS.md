# Contact custom fields (suggested names)

Use **native** Contact and **Company** fields for person data and business name / address / website / phones. Add these **Contact** custom fields for deal-specific webhook data.

Prefix every label with **`Mavcom `** (space after Mavcom, no dash).

---

| # | Field label | Type | Webhook path |
|---|-------------|------|--------------|
| 1 | Mavcom Expected monthly billing | Number | `totals.expectedMonthlyBilling` |
| 2 | Mavcom Total setup fees | Number | `totals.totalSetupFees` |
| 3 | Mavcom Sale date | Date | `billing.saleDate` |
| 4 | Mavcom Billing type | Text (or Dropdown) | `billing.billingType` |
| 5 | Mavcom CC collected | Text (or Dropdown) | `billing.ccCollected` |
| 6 | Mavcom Est. first charge date | Date | `billing.estimatedChargeDate` |
| 7 | Mavcom Rep name | Text | `rep.name` |
| 8 | Mavcom Rep email | Text | `rep.email` |
| 9 | Mavcom Agreement signed date | Date | `agreement.signedDate` |
| 10 | Mavcom Service start date | Date | `agreement.serviceStartDate` |
| 11 | Mavcom Deal notes | Large Text | `notes` |
| 12 | Mavcom Agreement confirmed | Checkbox | `confirmations.agreementSigned` |
| 13 | Mavcom Payment confirmed | Checkbox | `confirmations.payment` |
| 14 | Mavcom Onboarding confirmed | Checkbox | `confirmations.onboarding` |
| 15 | Mavcom Products JSON | Large Text | `productsJson` or `products.json` *(string; same data as `products` array)* |
| 16 | Mavcom Submitted at | Text | `submittedAt` |

**Optional:** **Mavcom Source** (Text) ← `source` (e.g. `maverick-deal-form`).

---

**Do not** duplicate native Company/Contact data (address, website, business phone, legal name) as custom fields if you map `business.*` to Company and `contact.*` to Contact.

See `DEAL-WEBHOOK-RUNBOOK.md` for workflow order (Company → Contact → link → map fields).
