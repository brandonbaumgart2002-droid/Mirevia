# ParaPatrol™ product page (JoySpring)

`index.html` is a single standalone file: HTML, Tailwind (Play CDN) and a small inline script with no dependencies. Open it in a browser to review.

## Sections (brief §4, in order)
Announcement bar → Hero (gallery, badges, headline, rating, subhead, ticks, buy box) → Sound familiar? → Why made-for-kids matters (comparison table) → How it works → Ingredients (accordion + supplement facts) → How to use → Safety & who it's for (always visible) → Reviews (breakdown + topic filter) → Founder strip → Bundle → FAQ → Final CTA → FDA footer. There is also a sticky add-to-cart bar on mobile.

## Things to know
- **Headline A/B:** add `?h=a`, `?h=b` or `?h=c` to the URL. A is the default.
- **Buy box:** Subscribe is selected by default. Plan, frequency (30/60/90) and quantity are shared between the hero box, the final CTA and the sticky bar. The button shows the live total, and a free-shipping line counts toward $65.
- **Cart:** this is a demo. It updates the bag count, shows a toast and fires `parapatrol:add-to-bag` and `parapatrol:add-bundle` events (`event.detail` holds plan, frequencyDays, quantity and total). In Shopify, connect these to `/cart/add.js` with the subscription `selling_plan`.
- **Asterisks:** every `*` links to the FDA disclaimer (`#fda`). The full text is shown under the hero and in the footer.
- **Brand colours:** edit the CSS variables at the top of `<style>` (`--brand-primary`, `--brand-accent`, `--brand-berry`, `--bg-soft`, `--bg-mint`, `--ink`, `--ink-muted`, `--line`). Fonts are Fredoka (display) and DM Sans (body), with system fallbacks.
- **Production:** the Tailwind Play CDN is for review only. For production, compile Tailwind with the same `tailwind.config` from the `<head>`, or port this page to a Shopify section.

## Placeholders to resolve
Search the file for `[VERIFY` and `[IMG:`. They are styled yellow (VERIFY) and dashed mint (IMG) so they are easy to spot.
- `[VERIFY: rating]`, `[VERIFY: review count]`, star breakdown counts, and the star rating of each featured review
- `[VERIFY: thujone-free wormwood spec]` (ingredients + safety)
- `[VERIFY: licorice form / amount]` (ingredients + FAQ)
- `[VERIFY: dropper has 1 mL marking]` (how to use + FAQ)
- `[VERIFY: mg per serving]` for the proprietary blend in the supplement facts
- FAQ answers on licorice and Amazon are marked `[VERIFY answer with brand]`, with a draft beside each
- Guarantee refund steps

## Compliance notes
- The scan for banned words (§5) and claims (§2) is clean, with three exceptions. Each is required wording: the FDA disclaimer, the safety line "worms you can see", and the product name "Detox Zee Herbal". "Cleanse" appears only in brief-supplied copy ("Cleanse + soothe" and the comparison table).
- No stats, review counts or ratings have been invented. The only reviews used are the four supplied ones.
- Tested at 375, 768 and 1280 px: no horizontal scroll and no console errors. The toggle, frequency, stepper, sticky bar, accordions (keyboard) and review filter all work.

## Shopify theme version
`shopify/` holds the same page as Online Store 2.0 sections, snippets, assets and a `product.parapatrol.json` template, all editable in the theme editor. Install steps and setup are in `shopify/README.md`. The build, preview and Theme Check tooling is in `build/`.
