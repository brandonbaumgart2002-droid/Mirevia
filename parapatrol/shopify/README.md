# ParaPatrol™ product page for Shopify (Online Store 2.0)

This is the ParaPatrol page from `../index.html`, rebuilt as Shopify theme sections. It works with your current theme (Dawn or any 2.0 theme): your header, footer and cart stay as they are. Every heading, line of copy, image, review and FAQ can be edited in the theme editor.

## What's here

| File | What it is |
|---|---|
| `templates/product.parapatrol.json` | The whole page in brief order, filled in with the approved copy |
| `sections/parapatrol-announcement.liquid` | Offer strip |
| `sections/parapatrol-main.liquid` | Gallery, badges, headline A/B/C, rating, buy box, sticky mobile bar. Also holds the **brand colours and fonts** for every ParaPatrol section |
| `sections/parapatrol-familiar.liquid` | "Sound familiar?" moments |
| `sections/parapatrol-compare.liquid` | ParaPatrol vs adult tinctures table |
| `sections/parapatrol-how-it-works.liquid` | Settle / Reset / Strengthen |
| `sections/parapatrol-ingredients.liquid` | Herb accordions + supplement facts |
| `sections/parapatrol-how-to-use.liquid` | Dosing steps, what to expect, first-time tip |
| `sections/parapatrol-safety.liquid` | Safety & who it's for (always visible, never an accordion) |
| `sections/parapatrol-reviews.liquid` | Rating summary, topic filter, featured quotes, review app slot |
| `sections/parapatrol-founder.liquid` | Founder strip + trust badges |
| `sections/parapatrol-bundle.liquid` | "Complete the routine" one-click bundle |
| `sections/parapatrol-faq.liquid` | FAQ accordion + FAQ structured data |
| `sections/parapatrol-final-cta.liquid` | Closing headline + second buy box |
| `sections/parapatrol-disclaimer.liquid` | FDA disclaimer. Every `*` on the page links here |
| `snippets/parapatrol-*.liquid` | Buy box, image/placeholder, icons, asterisk-to-disclaimer helper |
| `assets/parapatrol.css` | Compiled styles (about 18 KB), scoped under `.pp` so they can't affect the rest of your theme |
| `assets/parapatrol.js` | Behaviour, no libraries |

## Install

**With Shopify CLI (recommended):** copy the `sections`, `snippets`, `assets` and `templates` folders into your theme, then run `shopify theme push --unpublished` and open the new theme.

**Without code tools:**
1. In Shopify admin, go to **Online Store → Themes**. Click **… → Duplicate** on your theme, so you work on a copy.
2. On the copy, click **… → Edit code**.
3. Add each file under the folder of the same name. Use **Add a new section**, **Add a new snippet**, or **Add a new asset → Create a blank file**. Keep the file names exactly as they are here, then paste in the contents and save.
4. Under **Templates**, click **Add a new template**, choose **product**, type **JSON**, name it `parapatrol` and paste in `product.parapatrol.json`.
5. Go to **Products → ParaPatrol™** and set **Theme template** to `parapatrol`.
6. Click **Customize** on the copy, open the ParaPatrol product, and check the page. Publish when you're happy.

## Set these up in Shopify

- **Subscribe & save:** the buy box reads the product's **selling plans**. Create a subscription with Shopify Subscriptions (or Recharge, Skio, Loop, etc.) with 30, 60 and 90-day options at 15% off. Subscribe is selected by default, and the frequency list comes straight from those plans. Until a plan exists, only one-time purchase shows, and a setup note appears in the theme editor.
- **Free shipping over $65:** the buy box only shows how close the customer is. Set the actual free shipping rate in **Settings → Shipping**. You can change the threshold in the product section (and in the final CTA).
- **Bundle:** pick the three products in the Bundle section. The button adds one of each to the cart. The $97.47 is only a label, so create a matching discount or use a bundles app, or checkout will charge full price. Leave the price label blank to show the combined price.
- **Reviews:** the stars read Shopify's standard review metafields (`reviews.rating`, `reviews.rating_count`). Judge.me, Okendo, Loox, Yotpo and Shopify Product Reviews all fill these in. Add your review app's widget as an **app block** inside the Reviews section. Until there's data, the `[VERIFY]` text shows, so clear the fallback text in settings before going live.
- **Images:** add product photos to the product, and they replace the gallery placeholders automatically. Every other image (herb flat lay, dropper, founders, final CTA, step illustrations) has an image picker in its section.
- **After Add to Bag:** in the product section, choose whether to open the theme's cart drawer, show a message, or go to the cart page. The drawer works with Dawn-family themes. For other themes the page shows a message and fires a `parapatrol:added` event your developer can hook into.

## Headline A/B test
Add `?h=a`, `?h=b` or `?h=c` to the product link. Pick the default headline in the product section.

## Before you publish
Search the theme editor (or the template file) for `[VERIFY`, `[IMG:` and `[SETUP]`. On the page they show as yellow tags and dashed boxes. Resolve every one:
- Rating and review count, star breakdown, and the star rating of each featured review
- Thujone-free wormwood spec (ingredients + safety)
- Licorice form / amount (ingredients + FAQ)
- Dropper 1 mL marking (how to use + FAQ)
- Proprietary blend mg per serving (supplement facts)
- FAQ answers on licorice, Amazon and refund steps

FAQ answers that still contain `[VERIFY` are left out of Google's FAQ data until they're fixed.

## Compliance guardrails
- Claims stay on gut comfort, digestion, regularity, appetite and "back on track". Any `*` you type in a claim becomes a link to the FDA disclaimer, so keep the asterisk on every claim you add.
- Keep the Safety and FDA disclaimer sections on the template.
- Featured reviews must not mention behaviour, seeing worms, or medical conditions.

## For developers
`../build` holds the tooling:
- `npm install`, then `npm run build` recompiles `assets/parapatrol.css` from the classes used in the Liquid and JS. Run it after adding new Tailwind classes. Utilities are scoped under `.pp` and sized in px, so a theme with `html { font-size: 62.5% }` can't shrink them.
- `npm run preview` renders the template with a mock product and opens it at http://localhost:8080. It needs no store. The cart calls 404 there, which is expected.
- `npm run check` runs Shopify Theme Check. It's clean apart from a warning that Google Fonts are remote. To avoid that, turn off Google Fonts in the product section and upload the font files to the theme, or use the theme's fonts.
