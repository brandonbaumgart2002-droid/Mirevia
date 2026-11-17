# PlugPal™ single-product site

A one-product store page for the PlugPal 9-Port Outlet Extender. It copies the look of the live Mirevia theme (ReadySip PDP: Anton headings, Inter body text, Mirevia blue and navy) and follows Blomar's section order: gallery and buy box, UGC videos, how it works, use cases, comparison, FAQ.

The copy comes from the three research docs (Product Research, Avatar Research, Customer Language).

## Files

| File | What it is |
|---|---|
| `index.html` | The whole page |
| `assets/plugpal.css` | Styles |
| `assets/plugpal.js` | Gallery, pack picker, free-gift unlocks, sticky buy bar, accordions, video row, night-light demo |
| `images/` | Put photos here (see the shot list below) |

Open `index.html` in a browser to preview it. No build step.

## Page order

1. Announcement bar (rotates 3 offers) and header
2. Gallery (8 shots) and buy box: title, 6 benefits, colour, 1 / 2 / 4 packs, free gifts that unlock by pack, checkout button, 30-day guarantee, accordions (box, install, specs, fit, shipping, refunds)
3. "Two Plugs. Seven Things." UGC video row
4. Benefit ticker
5. How it works: 3 install steps, plus 5 / 2 / 2 / 1 port count
6. One outlet, every room: kitchen, bedroom, bathroom, living room, hallway, rental
7. Night light, with a lights-off demo
8. "It adds sockets, not power": the load guide (what goes in PlugPal, what goes in the wall)
9. "Skip the $280-per-outlet quote": electrician vs PlugPal
10. PlugPal vs power strip vs cube adapter
11. "Old houses, new gadgets": problem quotes from forums (labelled as such), then a slot for your review app
12. FAQ (13 questions from the objection list)
13. Email signup and footer with the safety line

## Before launch

The page opens with `class="draft"` on `<body>`. Every claim to check against your sample is highlighted yellow. Check each one, then delete `class="draft"`. That also hides the two dashed "goes here" notes.

What's highlighted:

- **Prices**: $34.99 / $59.99 / $99.99 (so the 4-pack works out to $24.99 a room), and the $24.99 in the electrician section
- **Free gifts**: long-screw kit ($6.99) and cord-tidy clip set ($9.99). Swap them for gifts you can actually ship.
- **Shipping times**: 1–3 days to process, 6–12 to deliver
- **Specs**: USB-C wattage, joule rating (1,050J, the lowest claim in the research), 3 brightness levels, flame-retardant housing, **ETL listing**, dimensions
- **Night light**: "tap the light icon" in the FAQ

Don't publish a safety certification you haven't seen the certificate for.

### Reviews and rating

This static page has no star rating or customer reviews. The Shopify version reads both from Judge.me (see below). The forum quotes describe the problem and say so; don't relabel them as PlugPal reviews.

### Checkout

Open `assets/plugpal.js` and paste your Shopify variant IDs into `CONFIG.variants` (one per colour and pack). The buy buttons then go to `mirevia.com.co/cart/<id>:1`. If you sell one variant and use quantity for the pack, set the colour to a single ID string instead, e.g. `white: '4512…'`.

### Email signup

The form checks the address and shows "You're on the list" but doesn't send anything yet. When this moves into the Shopify theme, swap it for the theme's `{% form 'customer' %}` newsletter form.

## Shot list (drop files into `images/`)

Each image slot shows a brief until a file with that name exists. Square for the gallery, 9:16 for videos (use a poster frame), 4:3 for steps, 16:10 for rooms.

| File | Shot |
|---|---|
| `gallery-1.jpg` | Hero: PlugPal on a white wall plate, night light on, phone and lamp plugged in. The text tile hides once this exists, so put any headline on the image itself |
| `gallery-2.jpg` | Before/after: crowded 2-socket outlet, then PlugPal with 9 ports in use |
| `gallery-3.jpg` | Install in 3 frames: remove screw, plug in, re-screw |
| `gallery-4.jpg` | Dark hallway at 3am, soft glow from the outlet |
| `gallery-5.jpg` | Cheap cube adapter sagging out of a worn outlet next to PlugPal screwed flat |
| `gallery-6.jpg` | Coffee station: coffee maker and two phones, clean counter (no kettle + toaster together) |
| `gallery-7.jpg` | Dimensions, mounted next to a light switch |
| `gallery-8.jpg` | What's in the box |
| `video-1.jpg` … `video-5.jpg` | UGC posters: install demo, coffee station, charger fight, 3am hallway, power strip vs flush outlet |
| `step-1.jpg` … `step-3.jpg` | Close-ups of the three install steps |
| `room-kitchen.jpg`, `room-bedside.jpg`, `room-bathroom.jpg`, `room-tv.jpg`, `room-hallway.jpg`, `room-rental.jpg` | One room each |

Keep the kitchen shots to chargers and one heating appliance. The research is clear that "run all your appliances" is the claim to avoid.

## On Shopify

It's on the theme **Mirevia live + PlugPal PDP** (unpublished). That theme is a copy of the live ReadySip theme, so the live store hasn't changed.

What was added or changed on that theme (copies in `shopify/`):

| File | What it does |
|---|---|
| `templates/product.plugpal.json` | The PlugPal product template: which sections are on the page, in what order, with their text |
| `sections/plugpal-product.liquid` | **Plug-Pal fold**: gallery, rating tile, name, sub-text, perks (blocks), offer box, colour, packs, gifts, buy button, guarantee, drop-downs (blocks), review card, sticky bar. Loads the styles, icons and script, so the other sections need it on the page |
| `sections/plugpal-videos.liquid` | **Plug-Pal videos**: amber band and video slider (one block per video, no text over the videos) |
| `sections/plugpal-features.liquid` | **Plug-Pal icon grid**: used twice, for How It Works and One Outlet. Every Room |
| `sections/plugpal-surge.liquid` | **Plug-Pal surge**: device prices (US and Canada figures), total, spec lines, button |
| `sections/plugpal-compare.liquid` | **Plug-Pal comparison**: table rows are blocks |
| `sections/plugpal-faq.liquid` | **Plug-Pal FAQ**: one block per question |
| `sections/plugpal-signup.liquid` | **Plug-Pal email signup** |
| `sections/plugpal-reviews.liquid` | **Plug-Pal reviews**: the full Judge.me list. Not on the page; add it back from **Add section** if you want it |
| `snippets/plugpal-media.liquid` | One image or video slot |
| `snippets/plugpal-pack-price.liquid` | A pack's price, was-price and per-outlet price in the shopper's market currency |
| `snippets/plugpal-per-outlet.liquid` | The 6-pack price per outlet with its currency code, for the `[per_outlet]` button text |
| `snippets/plugpal-specs.liquid` | Turns a drop-down's "Label: value" lines into the spec table |
| `assets/plugpal-pdp.css` | Styles, scoped to `:is(#plugpal,.pp-scope)` so they apply in every Plug-Pal section. It includes guards against the theme's global `!important` font, heading, radius and letter-spacing rules |
| `assets/plugpal-pdp.js` | Gallery, packs, buy button, sticky bar, review card, accordions and video slider; re-binds when the theme editor reloads a section |
| `patches/fc-site-layer.liquid` | Stops the site layer redirecting the PlugPal page to Blackout Buddy |
| `patches/parapatrol-announcement.liquid` | Adds a "Text on the PlugPal page" setting to the announcement bar |
| `patches/fc-footer.liquid` | PlugPal links, shipping line and small print in the footer on the PlugPal page |
| `patches/pp-cart-top.liquid` | Top of the cart drawer: the free-shipping tile is switched off (it only shows when the snippet is given `show_ship: true`); the banner under it stays |
| `patches/cart-timer-bar.liquid` | The theme's cart countdown, plus two small scripts: restart the countdown whenever the drawer is redrawn (buy buttons, the protection switch, the theme editor), and in the theme editor open the drawer when its section or a block is selected |
| `patches/cart_shipping_protection_style.liquid` | The theme's shipping-protection style snippet, plus: hides the switch in ReadySip carts (they have their own) and draws a shield icon, because the theme's built-in icon PNG is corrupt |

The script on the theme is the same code with indentation and comments stripped.

### Editing in the theme editor

Every section on the page is its own section in the theme editor, so you can edit, hide, reorder or delete each one, and add more from **Add section** (they're listed under the Plug-Pal names). Headings use italic for the amber words. Button text can include `[per_outlet]`, which fills in the 6-pack price per outlet.

The rating tile above the product name is in **Plug-Pal fold > Review rating above the name**: show or hide it and the stars, edit the wording (`[rating]` and `[count]` are filled in from Judge.me so they always match your real reviews), and choose where it links. The review card's "Verified buyer" label is under **Review card**; reviews that aren't from verified buyers show no label.

### Gallery and cart drawer

The gallery shows the first 6 product images (setting: **Plug-Pal fold > Gallery**), then one photo per variant. Picking a colour or pack switches the gallery to that variant's photo.

The buy button (and the sticky bar's) adds the pack and opens the theme's cart drawer (setting: **Plug-Pal fold > Buy button**; it can also go straight to checkout or to the cart page). On the PlugPal page the drawer is recoloured black and amber from **Plug-Pal fold > Cart drawer on this page** (colour pickers for the checkout button, accents, shipping bar and the banner, plus an on/off switch); other pages keep the drawer's own colours from Theme settings. Everything else in the drawer (countdown, banner, shipping protection, badges) is edited in the **Cart drawer** section: in the theme editor, click it (or one of its blocks) and the drawer opens so you can see your changes. Add something to the cart in the editor preview first, as most drawer blocks only show with items in the cart. Leave the drawer's *Cart Customization Mode* off: it keeps the drawer from closing for shoppers too.

Shipping protection is the theme's own **Shipping Protection** block in the cart drawer (Theme settings > Cart Drawer), switched on and linked to the *Shipping Protection* product (US $2.99, Canada $3.99 from the market price lists). It sits above the order summary, off by default, like Blomar's. In `config/settings_data.json` the block was enabled with dark text, bold heading, 13px description, and the drawer banner text changed from "Back to School Discount Auto-Applied" to "Join Our Happy Customers!".

### Currency by market

Prices are rendered on the server in the shopper's market currency with the code shown: USD in the US, CAD in Canada. That covers the pack prices, was-prices, per-outlet prices, sticky bar and the per-outlet buttons further down. Text figures that aren't product prices have a US and a Canada field: the gift values (fold section) and the surge device prices, total and small print (surge section). The Canadian surge figures are approximate conversions of the US ranges; check them before launch. Markets other than the US and Canada see those text figures hidden rather than in the wrong currency.

### Preview it now

There's no PlugPal product in the store yet, so preview the template on any product:

`https://mirevia.com.co/products/readysip-reserve-straw?view=plugpal&preview_theme_id=191185879320`

(It shows ReadySip's photos and prices there because the page reads whichever product it's on.)

### Colours

The Shopify page matches the product: black, white and the warm amber of the night light. The palette lives in the `#plugpal` variables at the top of `assets/plugpal-pdp.css` (`--navy` near-black, `--gold` amber, `--glow` light amber, `--amber-ink` amber text on white, `--glow-soft` the soft glow behind the selected pack and buttons). On the PlugPal page the announcement bar is black with an amber pill, and the logo dot is amber.

### To finish

1. The PlugPal product has a **Colour** option (White, Black) and a **Pack** option (1 Pack, 3 Pack, 6 Pack). Prices: US $36.99 / $73.99 / $114.99 (variant price and the United States price list) and Canada CA$51.99 / CA$99.99 / CA$164.99 (fixed prices on the Canada CAD price list). The page reads the shopper's market price, adds the matching variant to the cart, shows the cost of buying that many singles struck through, and works out the per-room price. Each variant has its own pack photo; the bundle cards show the photo for the chosen colour.
   The static mock-up in this folder (`index.html`) still shows the earlier 1 / 2 / 4 packs and draft prices.
2. Set the product's **Theme template** to `plugpal`.
3. In the theme editor, check the gifts and shipping lines, the spec table in **Details** (the size line still says to add measurements) and the FAQ answer about dimensions.
4. Reviews come from Judge.me; turn on its app embed in **Theme settings > App embeds**. The rating tile reads the `reviews.rating` and `reviews.rating_count` metafields, and the review card in the buy box shows the first 12 Judge.me reviews one at a time. Nothing is hard-coded: with no reviews the tile shows the Judge.me badge and the card stays hidden.
5. PlugPal is on the Online Store sales channel, so `/products/plugpal-outlet-extender` works in the theme preview. On the live theme (ReadySip PDP) its site layer sends that link to Blackout Buddy, so shoppers only see the PlugPal page once the PlugPal theme copy is published. Publish the theme when you're ready. The home page and logo in this theme still go to ReadySip, as on the live site.
