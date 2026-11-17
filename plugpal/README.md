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
| `templates/product.plugpal.json` | The PlugPal product template |
| `sections/plugpal-product.liquid` | The whole page as one section: images, videos, prices, gifts and shipping lines are editable in the theme editor |
| `snippets/plugpal-media.liquid` | One image or video slot (shows the written shot brief until you add a file) |
| `assets/plugpal-pdp.css` | Styles, all scoped under `#plugpal`. It includes guards against the theme's global `!important` font, heading, radius and letter-spacing rules |
| `assets/plugpal-pdp.js` | Gallery, packs, buy button, sticky bar, accordions, videos, night-light demo |
| `patches/fc-site-layer.liquid` | Stops the site layer redirecting the PlugPal page to Blackout Buddy |
| `patches/parapatrol-announcement.liquid` | Adds a "Text on the PlugPal page" setting to the announcement bar |
| `patches/fc-footer.liquid` | PlugPal links, shipping line and small print in the footer on the PlugPal page |

The copies of the section and script on the theme are the same code with indentation and comments stripped.

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
3. In the theme editor (PlugPal page section), add images and videos, check the gifts and shipping lines, and untick **Highlight claims to check** once everything in yellow is verified.
4. Reviews come from Judge.me; turn on its app embed in **Theme settings > App embeds**. The buy-box star rating reads the `reviews.rating` and `reviews.rating_count` metafields. The `#reviews` section turns the reviews in Judge.me's widget into a card carousel (first 12, in Judge.me's sort order), with the full Judge.me widget below it. Each card keeps Judge.me's "Verified buyer" and "collected from another provider" labels. Nothing is hard-coded: if Judge.me has no reviews, the carousel stays hidden. The heading and the full-widget switch are in the section's **Reviews** settings.
5. PlugPal is on the Online Store sales channel, so `/products/plugpal-outlet-extender` works in the theme preview. On the live theme (ReadySip PDP) its site layer sends that link to Blackout Buddy, so shoppers only see the PlugPal page once the PlugPal theme copy is published. Publish the theme when you're ready. The home page and logo in this theme still go to ReadySip, as on the live site.
