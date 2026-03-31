# Contact custom fields (suggested names)

Use **native** Contact and **Company** fields for person data and business name / address / website / phones. Add these **Contact** custom fields for deal-specific webhook data.

Prefix every label with **`Deal `** (space after Deal, no dash).

---

| # | Field label | Type | Webhook path |
|---|-------------|------|--------------|
| 1 | Deal Expected monthly billing | Number | `totals.expectedMonthlyBilling` |
| 2 | Deal Total setup fees | Number | `totals.totalSetupFees` |
| 3 | Deal Sale date | Date | `billing.saleDate` |
| 4 | Deal Billing type | Text (or Dropdown) | `billing.billingType` |
| 5 | Deal CC collected | Text (or Dropdown) | `billing.ccCollected` |
| 6 | Deal Est. first charge date | Date | `billing.estimatedChargeDate` |
| 7 | Deal Rep name | Text | `rep.name` |
| 8 | Deal Rep email | Text | `rep.email` |
| 9 | Deal Agreement signed date | Date | `agreement.signedDate` |
| 10 | Deal Service start date | Date | `agreement.serviceStartDate` |
| 11 | Deal notes | Large Text | `notes` |
| 12 | Deal Agreement confirmed | Checkbox | `confirmations.agreementSigned` |
| 13 | Deal Payment confirmed | Checkbox | `confirmations.payment` |
| 14 | Deal Onboarding confirmed | Checkbox | `confirmations.onboarding` |
| 15 | Deal Products JSON | Large Text | `productsJson` or `products.json` *(string; same data as `products` array)* |
| 16 | Deal Submitted at | Text | `submittedAt` |

**Optional:** **Deal Source** (Text) ← `source` (e.g. `deal-submission-form`).

---

**Do not** duplicate native Company/Contact data (address, website, business phone, legal name) as custom fields if you map `business.*` to Company and `contact.*` to Contact.

See `DEAL-WEBHOOK-RUNBOOK.md` for workflow order (Company → Contact → link → map fields).
