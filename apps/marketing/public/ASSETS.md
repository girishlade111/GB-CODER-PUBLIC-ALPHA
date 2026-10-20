# Shipping raster provenance

Every raster that ships with the marketing site is listed here with its origin.
The site renders its own imagery: no stock photography, no scraped artwork and
no third-party illustration enters the build.

## `og-image.png`

- **Size / format:** 1200 × 630 PNG, ≈56 KB. The Open Graph and Twitter card
  dimensions, so social platforms crop nothing.
- **Origin:** generated in-repository with `ffmpeg` from an SVG-free, purely
  geometric composition: the mineral mint canvas, an emerald edge rule, the
  GB monogram, the wordmark, the tagline, and an abstract code-and-preview
  motif drawn from the same palette as the live site.
- **Typography:** Manrope (SIL Open Font License 1.1), the site's own display
  face, rasterised from the upstream variable font.
- **Palette:** every fill resolves to a token in `src/styles/site.css`
  (`--canvas`, `--surface`, `--surface-soft`, `--border`, `--primary`,
  `--code-bg`) so the card cannot drift from the site.
- **Regeneration:** the filter graph is kept in the build notes for this
  change; re-render with the same ffmpeg `lavfi` pipeline and the same
  `drawbox`/`drawtext` primitives.
- **Usage:** `og:image`, `og:image:width`, `og:image:height`,
  `og:image:type`, `twitter:image` and `apple-touch-icon`.

## `tghjkl.jpeg`

- **Size / format:** 736 × 745 JPEG, ≈16 KB.
- **Origin:** retained unchanged from the repository root. It predates the
  current design system and its upstream provenance is not recorded anywhere
  in this repository.
- **Usage:** referenced only as the `Organization.logo` identifier in the
  JSON-LD graph. It is not used as an Open Graph card, not displayed on any
  page and not used as a decorative image.
- **Note:** it is a near-square raster in a slot that expects a mark. If a
  dedicated brand mark is produced later, replace this reference and remove
  the file in the same change.

## Fonts

Manrope Variable ships as WOFF2 through `@fontsource-variable/manrope` and is
served from the app's own bundle. No font is fetched from a third-party CDN at
runtime.
