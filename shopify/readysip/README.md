# ReadySip Reserve Straw™ product page for Shopify

A product page for **ReadySip Reserve Straw™ — Emergency Water Filter**. It follows the layout of the two emergency-straw pages we benchmarked (Lifelist Lab and Outrive): announcement bar, gallery with image counter, uppercase title, scenario intro with a bold promise line, tick bullets, add to cart, payment icons, an honest-filtration section, an Us-vs-Others table, review cards, FAQ and guarantee cards. The copy comes from the ReadySip research docs (avatar research, product research, objections).

It works alongside your current theme: your header, footer and cart stay as they are.

## What's on the page, top to bottom

| Section | File | What it does |
|---|---|---|
| Announcement bar | `readysip-announcement` | Rotating message ("Storm season is here…", gift line) |
| Product | `readysip-product` | Gallery, title, intro, ticks, price, **pack picker**, low-stock note, add to cart, payment icons, trust row, accordions, floating add-to-cart bar |
| Ticker | `readysip-marquee` | Scrolling strip: No batteries · No chemicals · 0.1-micron membrane… |
| Problem | `readysip-split` | "Your tap depends on things you don't control" |
| How it works | `readysip-steps` | Soak and prime → Drink your way → Backflush and store |
| Ways to drink | `readysip-steps` | Sip / bottle / squeeze / gravity ("Squeeze, don't suck") |
| Honest limits | `readysip-limits` | What it filters vs what it doesn't, plus the floodwater note |
| One per person | `readysip-split` | Kitchen, every glovebox, every bag |
| Comparison | `readysip-compare` | ReadySip kit vs basic straw vs bottled water |
| Gift | `readysip-split` | "For the one who's always prepared" (Nov–Dec) |
| Reviews | `readysip-reviews` | Review cards or your review app. Hidden until it has real reviews |
| FAQ | `readysip-faq` | The 9 big objections, marked up for Google |
| Guarantee | `readysip-guarantee` | Guarantee, support and secure-checkout cards, then a final "Choose your pack" |

Files: `sections/` (9 sections), `snippets/readysip-icon.liquid` (icons), `assets/readysip-pdp.css` and `assets/readysip-pdp.js` (no apps or libraries), and `templates/product.readysip.json` (puts it together with the copy).

## 1. Set up the product first

The pack picker reads your product's variants, so prices, compare-at prices, savings and stock all come from Shopify.

1. Create the product **ReadySip Reserve Straw™ — Emergency Water Filter**.
2. Add one option called **Pack** with these values, spelled exactly like this: `1 Straw Kit`, `2-Pack`, `5-Pack Family Kit`, `10-Pack Extended Family`. (Your store's product already uses these.)
3. Give each variant a **price** and a **compare-at price**. The "Save X%" badges and the "$X per straw" line are worked out from these.
4. Turn on **Track quantity** if you want the "Only X left of this pack" note. It only shows when real stock is at or below 20, and you can change that number in the theme editor.

If you want different pack sizes, rename the variants and update the matching **Variant name** and **Straws in this pack** fields in the Pack picker block.

## 2. Install

1. In Shopify admin go to **Online Store → Themes**. On your current theme click **… → Duplicate**, so you work on a copy.
2. On the copy click **… → Edit code**.
3. **Sections**: for each file in `sections/`, click **Add a new section**, choose **liquid**, give it the same name (e.g. `readysip-product`), paste the file's contents over what's there, and save.
4. **Snippets**: click **Add a new snippet**, name it `readysip-icon`, paste `snippets/readysip-icon.liquid`, and save.
5. **Assets**: click **Add a new asset → Create a blank file**, make `readysip-pdp.css` and `readysip-pdp.js`, paste each one, and save.
6. **Templates**: click **Add a new template**, choose **product**, type **JSON**, name it `readysip`, paste `templates/product.readysip.json`, and save.
7. Open the product in **Products**, set **Theme template** to `readysip`, and save.
8. Back in **Themes**, click **Customize** on the copy, open the product page, and add your images (see below). When you're happy, **Publish**.

With Shopify CLI instead: `shopify theme pull`, copy these folders into the theme, then `shopify theme push --unpublished`.

## 3. Add your images

- **Gallery**: product media, in this order: hero shot, what's in the kit, squeeze into a cup, in a glovebox, dirty-to-clean demo, size next to a hand. The page shows "1 / 6" and arrows automatically.
- **Image + text sections** (problem, one per person, gift): pick an image in each section's settings. Until you do, they show a grey "Your image here" box.
- Optional: images on the "How it works" and "Ways to drink" cards.

## Before you publish, check these

Everything in **[square brackets]** is a placeholder that shows on the page until you change it.

**Must confirm with your supplier**
- **Rated capacity**: the page now says **up to 1,500 L (about 400 gallons) per straw**, taken from your product description. Keep your supplier's test report on file, because this is the number customers and ad reviewers will question.
- **0.1 micron, 3 stages (pre-filter, carbon, membrane), 28 mm thread, about 2 oz, about 7.5 in, BPA-free**: check each one against your unit.
- **What's in each kit**: the page lists straw, squeeze pouch, gravity tube, backflush syringe, lanyard and carabiner, and a soak-and-prime card, matching your product description. Remove anything you don't actually ship.
- **"Filters out" list**: microplastics and the carbon stage are typical for this category. Keep them only if your unit and test report back them up.
- **Your product description says "Blocks 99.9% of bacteria & parasites."** The page itself doesn't quote a percentage. Keep it in the description only if the test report shows it.

**Your policies**
- Filled in from your product description: **60-day peace-of-mind guarantee**, **ships within 24 hours**, **free shipping on 2+ straws** (shown on the 2-, 5- and 10-Pack cards and in the announcement bar). Make sure your refund and shipping policies say the same.
- Still placeholders: delivery time **[5–7] business days** (Shipping accordion) and support reply time **[one business day]** (guarantee cards).

**Comparison table**
- "Rarely" and the crosses in the **Basic straw** column describe a typical sip-only straw sold on its own. Check them against the competitors you're really up against, and edit any row that isn't fair.

## Things deliberately left out

- **No "FDA approved", "Sold out 3x this year" or "Trusted by 10,000+ families" style badges.** Both reference pages use claims like these, and our research flags them as the trust problem in this market (inflated counts, contradictory numbers). Add a badge only if it's true and you can back it up.
- **No claims about viruses, floodwater on its own, seawater or "never expires".** The page says plainly what the straw can't do. The research ranks that honesty as a selling point.
- **No made-up reviews or star counts.** The star rating reads your review app's data and stays hidden until you have reviews. The Reviews section and the "Customer quote" block in the buy box stay hidden until you add real ones. The `Customer_Reviews.pdf` file contains written examples, not reviews from real buyers, so they're not on the page. Publishing invented reviews as real ones breaks the FTC's fake-review rule in the US and the ACCC's rules in Australia. They work well as a guide to what to ask real customers about (where they keep it, who it's for, the first sip).

## Reviews

- **With a review app** (Judge.me, Loox, Okendo, Shopify Product Reviews): in the theme editor, open **ReadySip reviews → Add block** and pick the app's widget. The star line under the title fills in from the app automatically.
- **By hand**: add **Review** blocks with real customers' words, first name and initial, and optional location and photo.
- **Buy box quote**: once you have a strong real review, paste it into the **Customer quote** block. It shows under the trust row.

## Ad links

Send each ad to the product link; add `?variant=<id>` to open on a specific pack (for example, the 5-Pack for family-organiser ads). With no variant in the link, the page opens on **Tier 3 (Family 5-Pack)**. You can change that in the Pack picker block.
