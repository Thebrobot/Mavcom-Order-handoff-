# HighLevel: map product lines without `[object Object]`

The webhook sends **`products`** (an array of objects). If you map that to a **text** custom field, GHL shows **`[object Object],[object Object]`** — that is expected.

Use a **string** field instead. The app sends the same data in several shapes so you can find one that your UI exposes:

| Payload path | What it is |
|--------------|------------|
| `productsJson` | JSON **string** (camelCase) |
| `products_json` | Same string (snake_case — try if the picker lists snake_case keys) |
| `productsText` | Plain-text lines (camelCase) |
| `products_text` | Same plain text (snake_case) |
| `meta.productsJson` | Same JSON string under **`meta`** |
| `meta.productsText` | Same plain text under **`meta`** |

## What to do in the workflow

1. **Do not** map **`inboundWebhookRequest.products`** to **Mavcom Products JSON** (or any Large Text field).
2. In the field mapping, **clear the field** and **type** one of these by hand (even if it is not in the dropdown):
   - `{{inboundWebhookRequest.productsJson}}`  
   - or `{{inboundWebhookRequest.products_json}}`  
   - or `{{inboundWebhookRequest.productsText}}` (readable lines)  
   - or `{{inboundWebhookRequest.meta.productsJson}}`
3. Some builders have **“Custom value”**, **“Insert custom field”**, or **liquid** mode — paste the merge tag there.
4. **Publish** the workflow.
5. Confirm **Vercel** has deployed the latest app build, then submit a **new** test.

## Verify the payload

After a test run, open **workflow execution** / **payload** and confirm you see **`productsJson`** (string) at the top level. If it is missing, the live site is not on the latest build.
