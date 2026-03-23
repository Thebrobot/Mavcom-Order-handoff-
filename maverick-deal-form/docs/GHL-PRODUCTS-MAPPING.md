# HighLevel: map product lines without `[object Object]`

The webhook sends **`products`** (an array of objects). If you map that to a **text** custom field, GHL shows **`[object Object],[object Object]`** — that is expected.

## Do **not** use this (wrong)

`{{inboundWebhookRequest.products.text}}`

That means: **`products`** (the **array**) → **`.text`**. The array has no `text` property, so this is **not** the same as the string key `"products.text"`.

## Easiest (nested object — normal dots work)

| Merge tag | Contents |
|-----------|----------|
| `{{inboundWebhookRequest.productLines.json}}` | JSON string — use for **Mavcom Products JSON** |
| `{{inboundWebhookRequest.productLines.text}}` | Plain-text lines (human-readable) |

## Other paths (same data)

| Payload path | What it is |
|--------------|------------|
| `productsJson` | JSON string |
| `productsText` | Plain-text lines |
| `products.json` / `products.text` | Same strings; keys with a **dot in the name** need **brackets**: `{{inboundWebhookRequest['products.json']}}` |
| `meta['products.json']` | Same under **`meta`** |

CamelCase:

- `{{inboundWebhookRequest.productsJson}}`
- `{{inboundWebhookRequest.productsText}}`

## What to do

1. **Do not** map **`inboundWebhookRequest.products`** to **Mavcom Products JSON**.
2. Map one of the string paths above (start with **`productLines.json`** for JSON, or **`productsJson`**).
3. **Publish** the workflow.
4. Confirm **Vercel** has the latest build, then submit a **new** test.

## Verify the payload

After a test run, open the **raw payload** and confirm **`productsJson`** or **`"products.json"`** is present as a string.
