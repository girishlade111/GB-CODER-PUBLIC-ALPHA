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
- **Regeneration:** the exact ffmpeg filter graph ships with the asset in
  `public/og-image.filter.txt`. Re-render it with:

  ```
  ffmpeg -y -f lavfi -i "color=c=0xf5f8f6:s=1200x630:d=1" \
         -f lavfi -i "gradients=s=1200x630:c0=0xd7ece0:c1=0xf5f8f6:x0=1250:y0=0:x1=520:y1=520:seed=0:d=1" \
         -filter_complex_script public/og-image.filter.txt \
         -map "[out]" -frames:v 1 public/og-image.png
  ```

  Run the command from a directory that holds the Manrope variable font at
  `fonts/Manrope.ttf` (upstream: <https://github.com/google/fonts/tree/main/ofl/manrope>).
  The graph needs no network access and no design tool. The `seed=0` on the
  gradient source matters: without it `ffmpeg` randomises the wash and the
  card stops being reproducible.
- **Usage:** `og:image`, `og:image:width`, `og:image:height`,
  `og:image:type`, `twitter:image` and `apple-touch-icon`.

## `gbcoder-logo.png` & Favicon Suite

- **Size / format:** High-resolution brand logo PNG and multi-resolution favicon suite (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `favicon.svg`).
- **Origin:** Official GB Coder brand identity asset.
- **Usage:** Brand logo rendered across marketing navigation header, footer, IDE navigation bar, VS Code mode workbench title bar, and browser tab favicons / PWA manifest.

## Fonts

Manrope Variable ships as WOFF2 through `@fontsource-variable/manrope` and is
served from the app's own bundle. No font is fetched from a third-party CDN at
runtime.
