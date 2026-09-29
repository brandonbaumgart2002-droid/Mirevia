# Mirevia product page for Shopify

A premium product page in the style of Therabody's product pages, built on the Apple rules in `../DESIGN.md`. It works alongside your current theme: your header, footer and cart stay as they are.

## What's here

| File | What it is |
|---|---|
| `sections/mirevia-product.liquid` | Gallery, sticky buy box, floating add-to-bag bar |
| `sections/mirevia-personalise.liquid` | "Made for how your cycle feels": one tab per type of customer |
| `sections/mirevia-highlights.liquid` | Dark strip with 3–4 short claims |
| `sections/mirevia-feature-tiles.liquid` | Apple-style full-width panels |
| `sections/mirevia-testimonials.liquid` | "In their words": customer quotes, swipeable on mobile |
| `sections/mirevia-compare.liquid` | Mirevia vs hot water bottle vs heat patch |
| `sections/mirevia-faq.liquid` | FAQ, also marked up for Google |
| `assets/mirevia-pdp.css`, `assets/mirevia-pdp.js` | Styles and behaviour (no extra apps or libraries) |
| `templates/product.mirevia.json` | Puts it all together with starting copy |

## Install (no code tools needed)

1. In Shopify admin go to **Online Store → Themes**. On your current theme click **… → Duplicate**, so you work on a copy.
2. On the copy click **… → Edit code**.
3. For each file in `sections/`: under **Sections** click **Add a new section**, choose **liquid**, give it the same name (e.g. `mirevia-product`), and paste the file's contents over what's there. Save.
4. For each file in `assets/`: under **Assets** click **Add a new asset → Create a blank file**, pick the right type (`.css` / `.js`), name it `mirevia-pdp`, paste, save.
5. Under **Templates** click **Add a new template**, choose **product**, type **JSON**, name it `mirevia`, paste `templates/product.mirevia.json`, save.
6. Go to **Products → Mirevia™ The Cramp Ease**. In the right-hand column, set **Theme template** to `mirevia` and save.
7. Back in **Themes**, click **Customize** on the copy, open the product page, and check it. When you're happy, **Publish** the copy.

With Shopify CLI instead: `shopify theme pull`, copy these folders into the theme, then `shopify theme push --unpublished`.

## Before you publish, check these

- **Benefits** (under the title): the four feature lines come from your comparison image (3 heat levels, 3 massage modes, auto shut-off, fast warm-up). Check they match the product manual.
- **Perks** (buy box): "Free shipping", "30-day money-back guarantee" and "Secure checkout" should match what you actually offer.
- **What's in the box** accordion: replace with your real contents.
- **How to use it** accordion: check the steps match your quick-start guide.
- **Comparison table**: make sure every tick is true for your product.
- **FAQ**: the answers are deliberately general. Add your own, especially anything about sleeping with it on, auto shut-off and skin contact, following your product manual.
- **Images**: the "Made for you" tabs and both feature panels use the `mirevia-*.png` images in Files (see `IMAGE-BRIEF.md`). Swap in your own in the theme editor. A tab or panel with no image shows as text only; if you add a product cut-out on a plain background, tick "product shadow" for it.
- **Empty dropdowns are hidden**: "Overview" shows your product description, so it only appears once the product has one.
- **Colours**: if your colour options don't show the right swatch, set Shopify swatches on the option values, or edit the *Colour swatches* list in the product section settings.

## Personalised links for ads

Add `?for=` to the product link in each ad so the page opens on the matching story:

| Ad audience | Link ending |
|---|---|
| Period cramps | `?for=cramps` |
| Sleep | `?for=sleep` |
| Endometriosis / PCOS | `?for=endo` |
| Work and on the go | `?for=on-the-go` |

The page opens on that tab, shows a one-line "For you:" note in the buy box, and remembers the choice on that device. Logged-in customers also see "Welcome back, [first name]." Add, rename or remove tabs in the theme editor; each tab's **Link key** is what goes after `?for=`.

## Cart drawer

Add to bag opens your theme's cart drawer on the same page (product section setting **After add to bag → Open the cart drawer**). If the theme has no compatible drawer, it falls back to the cart page. Kaching bundles and free gifts are added exactly as before.

The drawer itself is part of your theme, not this folder. Three things were changed on the theme:

1. `assets/mirevia-cart.css` (in this folder) is uploaded to the theme and loaded by one line added to the top of the theme's `sections/cart-drawer.liquid`:
   `{{ 'mirevia-cart.css' | asset_url | stylesheet_tag }}`
2. Cart drawer settings (theme editor → Cart drawer): white and light-grey colours, near-black "Secure checkout" button, mulberry for savings and free-gift labels.
3. Cart drawer blocks: the countdown timer, the free-shipping progress bar (shipping is always free) and the hard-coded "Excellent 4.8 out of 5" rating are switched off; the top line reads "Free shipping on every order"; the guarantee line reads "30-day money-back guarantee". Switch the rating back on only once it shows real reviews.

## Site layer (announcement bar, newsletter, footer)

`assets/mirevia-theme.css` restyles the theme's own announcement bar, newsletter and footer to the warm palette and Fraunces headings. It is uploaded to the theme and loaded by one line added to `layout/theme.liquid` after `custom.css`:
`{{ 'mirevia-theme.css' | asset_url | stylesheet_tag }}`

Footer settings changed in the theme editor: warm colours (plum-brown footer, blush-cream newsletter), newsletter copy ("Notes for your next cycle"), and the empty "Products" and "Company" columns hidden until they have menus.

## Bundle picker (Kaching)

The Kaching bundle box inside the buy box is restyled by `mirevia-pdp.css` to the page's neutrals (white cards, ink selection, grey compare-at prices). Its wording, the "LOW STOCK — SELLING FAST" line and the free-gift offers are set in the Kaching app.

## Customer quotes

The "In their words" section holds your customers' quotes word for word, with each person's own star rating. It has the id `reviews`, so the rating link in the buy box jumps to it. Per quote you can:

- tick **Verified buyer**, only for people who bought from your store;
- add a **customer photo**, only a real photo of that customer shared with their permission.

There is deliberately no overall "X ratings" line: add one only when a reviews app supplies the real number.

## Reviews

The star rating reads Shopify's standard review metafields (`reviews.rating`, `reviews.rating_count`), which Judge.me, Loox, Okendo, Yotpo and Shopify Product Reviews fill in. It stays hidden until there are reviews. Add your review app's widget as an app block or section, and give it the id `reviews` if you want the stars to jump to it.
