# Playground audit: module defects to carry forward (19 Oct 2026)

Source: performance, SEO and UX audit of https://141885928.hs-sites-eu1.com/playground-template on 19 Oct 2026, using a chrome-devtools trace (mobile 390px, 4x CPU, Slow 4G) and DOM evaluation. CrUX has no field data for the page.

The page renders from the `CoreCode` theme (`main`), not from this branch, and uses about thirty page modules that this branch removed from the repo. The defects below therefore sit in the portal copies of those modules. They are not fixed here. Fix them in any module that is brought forward, alongside the items in `2026-09-21-backport-note.md`.

## Measured baseline

| Metric | Value | Note |
|---|---|---|
| LCP | 2,272 ms | `img.m-bannerHero__image`. TTFB 255, load delay 473, download 995, render delay 548 |
| CLS | 0.095 | One shift, caused by the unsized banner hero image |
| Render-blocking stylesheets | 36 | Mostly per-module CSS |
| Longest critical chain | 6,246 ms | `js.hsforms.net/forms/v2.js`, then form JSON that returns 404 |

## Module defects

| Module | Defect | Evidence | Fix |
|---|---|---|---|
| Banner hero | `<img>` has no `width`/`height` | CLSCulprits names it as the only root cause of the 0.095 shift | Render through `image_helper.render_image(..., priority=true)`, which emits both attributes and the LCP hints |
| Most image modules (features, gallery, latest news, logo section, quick links, testimonial, thumbnail gallery, text and media) | No `width`/`height` on 27 of 32 images, and no `srcset` on 28 | DOM count; the console reports "Lazy-loaded images should have explicit dimensions" 24 times | Use `render_image` throughout |
| Accordion | Item headings are `h3` straight under the page `h1` | Heading walk: `1->3 "What is your question?"` | Give the item heading a level choice field, defaulting to one below the module heading |
| Thumbnail gallery | "View" links render at 161x19 | Under the 24px target minimum (SC 2.5.8) | `min-block-size: var(--touchArea)` on the link |
| Icon grid | Heading links render at 168x17 | Same | Same |
| A gallery-area module | Emits `<link rel="stylesheet" href="">` | Rendered `<head>`; an empty `href` resolves to the page URL | Check the module's `require_css(get_asset_url(...))` path depth; `get_asset_url()` returns an empty string for a path that does not resolve |
| Form | Embeds form `bf0167b9-497a-46fe-80b3-8eb324f18e69`, which returns 404 | Network log | Content: choose a form that exists |

## Portal content and settings (not code)

- Page title "Playground template" (19 characters) and a lorem ipsum meta description.
- No favicon is set in website settings, so `/favicon.ico` returns 404. `base.html` only emits the icon link when `site_settings.favicon_src` is set.

## Open on this branch

- `templates/partials/seo_schema.html` sets `Organization.url` and `WebSite.url` to `content.absolute_url`, so each page claims to be the site root. It should be the homepage URL. Unverified which HubL variable gives that reliably; check against HubSpot's docs before changing it. On portal 141885928 the block does not render at all, because `site_settings.company_name` is empty.

## Fixed in this branch, verify once deployed

The live `main` head has these; this branch's `base.html` does not:

- The Google Fonts stylesheet loaded twice (once with the `media="print"` swap trick, once blocking), even though HubSpot already loads the theme's font fields.
- An inline script reading `document.body.offsetWidth` to set `--scrollbarWidth`, which the trace flags as a forced reflow.
- `main.css` and `theme_overrides.css` loaded through `rel="preload"` plus an `onload` swap.
