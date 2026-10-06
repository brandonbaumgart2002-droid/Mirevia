# Theme overrides

Files here are edited copies of the store theme's own files (not ParaPatrol sections). Copy them back into the theme if the theme is ever re-downloaded.

- `custom-footer.liquid`: the footer uses the ParaPatrol palette (white newsletter band, navy footer, ParaPatrol fonts) on every page except Mirevia product pages, which keep the Mirevia footer settings. The ParaPatrol newsletter copy ("Gentle tips for little tummies") shows on the ParaPatrol product page only. Search the file for `pp_footer` and `pp_copy`.
- `theme.liquid` (goes in `layout/`): two additions, both marked "ParaPatrol site layer". The head loads Baloo 2 and Nunito Sans and `assets/pp-site.css`. The `<body>` gets a `pp-site` class on every page except Mirevia product pages. `pp-site.css` uses that class to restyle the home page, catalogue, content pages and policy pages, and it restyles the cart drawer on every page. To undo the look, delete the `pp-site` line from the body class.
