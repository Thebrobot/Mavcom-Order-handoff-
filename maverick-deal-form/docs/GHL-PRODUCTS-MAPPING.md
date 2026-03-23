# HighLevel: map product lines without `[object Object]`

The webhook sends **`products`** (an array of objects). If you map that to a **text** custom field, GHL shows **`[object Object],[object Object]`** — that is expected.

Use a **string** field instead. The app sends the same data in several shapes:

| Payload path | What it is |
|--------------|------------|
| `productsJson` | JSON string (camelCase) |
| `productsText` | Plain-text lines (camelCase) |
| `products.json` | Same JSON string — **dot-style key** (use bracket syntax in merge tags below) |
| `products.text` | Same plain text — dot-style key |
| `meta.products.json` | Same JSON under **`meta`** |
| `meta.products.text` | Same plain text under **`meta`** |

Keys with a **dot** in the name are not the same as `products` + nested object — they are single string keys named `"products.json"` and `"products.text"`.

## Merge tags (type manually if needed)

Dot keys often need **bracket notation**:

- `{{inboundWebhookRequest['products.json']}}`
- `{{inboundWebhookRequest['products.text']}}`
- `{{inboundWebhookRequest.meta['products.json']}}`

CamelCase (no brackets):

- `{{inboundWebhookRequest.productsJson}}`
- `{{inboundWebhookRequest.productsText}}`

## What to do

1. **Do not** map **`inboundWebhookRequest.products`** to **Mavcom Products JSON**.
2. Map one of the string paths above (start with **`productsJson`** or **`['products.json']`**).
3. **Publish** the workflow.
4. Confirm **Vercel** has the latest build, then submit a **new** test.

## Verify the payload

After a test run, open the **raw payload** and confirm **`productsJson`** or **`"products.json"`** is present as a string.
