# Checkout branding (Shopify checkout editor)

Shopify's checkout isn't part of the theme, so these settings are made by hand in **Settings → Checkout → Customize**. They match the ParaPatrol product page: sage green, navy ink, soft mint and pink, Nunito Sans text.

## Header
- **Logo:** upload `mirevia-checkout-header.png` (1200 × 260, transparent). It's the wordmark plus three trust chips: 30-day money-back, Secure checkout, Free shipping.
- **Logo position:** centre. **Size:** the largest that fits without cropping (about 360–400 px wide).
- This replaces the current banner. That banner's "+4,000 Happy Customers" and stock faces don't match the 237+ reviews shown on the product page, so remove it unless you can back the number up.

## Colours
| Setting | Value | Why |
|---|---|---|
| Main background | `#FFFFFF` | Same as the product page |
| Order summary background | `#EBF4EF` (mint) | Same tint as the product page's trust tiles |
| Primary buttons ("Pay now") | `#3B7560`, white text | Same green as Add to Bag |
| Accent (links, checkboxes, the bag icon, focus rings) | `#3B7560` | Replaces the current gold and blue |
| Text | `#1E2D4F` | Navy ink from the product page |
| Form fields | White, border `#ECE1E5` | Product page hairline colour |

## Typography
- **Body:** Nunito Sans.
- **Headings:** Baloo 2 if it's in the font list; otherwise Nunito Sans.
- Base size: medium.

## Corners
Rounded (the product page uses pill buttons and 16–24 px cards). Where the editor offers a corner radius, pick the largest for buttons and a medium radius for fields.

## Order summary
- The struck-through total comes from the compare-at prices set in Kaching Bundles. Make sure those are real former prices before ads go live.

## Rebuilding the header image
`header.html` is the source. Open it in a browser with `baloo2.ttf` and `nunito.ttf` beside it, or re-run the Playwright screenshot of `#b` with a transparent background.
