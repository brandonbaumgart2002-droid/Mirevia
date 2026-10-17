# Abandoned checkout email

- `abandoned-checkout.liquid`: the Shopify notification template (HTML + Liquid).
- `abandoned-checkout-preview.html`: the same email filled with sample data, for previewing in a browser.

## Install (Shopify notification)
1. Shopify admin → Settings → Notifications → Customer notifications → **Abandoned checkout**.
2. Click **Edit code**.
3. Subject: `Your child’s reset is waiting 💚`
4. Replace the whole email body with the contents of `abandoned-checkout.liquid` and save.
5. Use **Preview** / **Send test email** to check it.
6. Settings → Checkout → Abandoned checkouts: turn on automatic emails (recommended: send after 10 hours, to anyone who abandons).

Uses Shopify's own variables: `url` (checkout recovery link), `line_items`, `subtotal_price`,
`billing_address.first_name` / `customer.first_name`, `shop.email_logo_url`. Free gift lines show "FREE".
Images are hosted in Shopify Files (pp-email-bottles.jpg, pp-email-family.jpg, mirevia-logo.png).

If you use Shopify Email's marketing automation (drag-and-drop) instead, copy the text and images across;
that editor does not accept custom HTML.
