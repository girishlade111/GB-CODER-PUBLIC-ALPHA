---
name: GB Coder Marketing
description: A mineral mint working canvas for browser development.
colors:
  canvas: "#f5f8f6"
  surface: "#ffffff"
  surface-soft: "#e8f0eb"
  border: "#ccd9d1"
  border-subtle: "#dfe7e2"
  text-primary: "#172e25"
  text-secondary: "#506258"
  text-muted: "#627268"
  primary: "#176644"
  accent-hover: "#104c33"
  code-bg: "#152b23"
  code-text: "#e4f1e9"
typography:
  display:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "clamp(3rem, 5.5vw, 5rem)"
    fontWeight: 550
    lineHeight: 1.06
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "clamp(2rem, 3.3vw, 3rem)"
    fontWeight: 550
    lineHeight: 1.14
    letterSpacing: "-0.035em"
  page-title:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "clamp(2.5rem, 5.5vw, 4.75rem)"
    fontWeight: 550
    lineHeight: 1.14
    letterSpacing: "-0.035em"
  body:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "1rem"
    lineHeight: 1.65
  button:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "0.88rem"
    fontWeight: 650
    lineHeight: 1.4
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "12px"
    lineHeight: 1.9
rounded:
  tag: "4px"
  tab: "6px"
  control: "8px"
  surface: "12px"
  example: "14px"
  stage: "16px"
spacing:
  half: "0.5rem"
  one: "1rem"
  gutter: "1.5rem"
  two: "2rem"
  three: "3rem"
  four: "4rem"
  section: "6.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0.7rem 1.3rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.surface}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0.7rem 1.3rem"
  button-ghost:
    backgroundColor: "transparent"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0.35rem 0.65rem"
  tab-selected:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.tab}"
    padding: "0.55rem 0.85rem"
  article-tag:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.tag}"
    padding: "0.2rem 0.55rem"
  mini-card:
    backgroundColor: "{colors.surface-soft}"
    rounded: "{rounded.surface}"
    padding: "1.5rem"
  code-sample:
    backgroundColor: "{colors.code-bg}"
    textColor: "{colors.code-text}"
    typography: "{typography.code}"
---

# Design System: GB Coder Marketing

## Overview

**Creative North Star: "The Working Canvas"**

A browser development studio expressed as a working canvas. Mineral mint space, forest ink and emerald actions give code and its visible result room to lead. Self-hosted Manrope keeps the presentation modern, professional and quietly artistic.

The shared visual system covers the marketing site and its reading surfaces. Library adaptations consume the same semantic palette; guides, articles and the directory use fine rules and readable measures instead of decorative card stacks. The separate editor is outside this system’s implementation boundary.

This is an implementation scan, not a record of user-selected concept options. The written direction is recorded in `.impeccable/surfaces/website.md`; no concept roll, seed key, decision comp or QUALITY BAR image was produced. The descriptive north star names the implemented system and does not assert an additional user confirmation.

**Key Characteristics:**

- Code and output as visual proof
- One mineral mint and emerald palette
- Generous spacing with fine rules
- Restrained controls and sparse icons
- Responsive, localized reading surfaces

## Colors

An airy, low-saturation green ground supports dark forest text and a concentrated emerald action color. Frontmatter contains the normative reusable color values; decorative CSS studies use additional local green tones.

### Primary

- **Emerald (`primary`)** marks filled actions, selected tabs, reading links and small active details. Hover deepens to `accent-hover`.
- The source variable `accent-terracotta` is a compatibility name for emerald, not a second warm accent. `primary`, `ring`, `background`, `foreground`, `muted` and `muted-foreground` alias the shared palette.

### Neutral

- **Mineral mint (`canvas`)** is the page ground; **white (`surface`)** frames previews and examples; **soft mint (`surface-soft`)** provides quiet tonal sections and callouts.
- **Forest ink (`text-primary`)**, **secondary foliage (`text-secondary`)** and **muted foliage (`text-muted`)** distinguish headings, prose and metadata.
- `border` separates structural rows; `border-subtle` divides toolbar and supporting content. `code-bg` and `code-text` supply the dark code plane.

**The Shared Palette Rule.** Adapted library components consume the marketing semantic tokens; the legacy accent-terracotta variable resolves to emerald.

## Typography

Self-hosted variable Manrope is the display and body face, with Segoe UI and sans-serif fallbacks. System monospace distinguishes source, filenames and terminal output. Variable weights keep large headings calm and compact controls precise.

- **Display:** the home title uses the frontmatter display role and an approximately 11-character measure. On small screens it becomes `clamp(2.8rem, 12vw, 4.2rem)` with a 13-character measure.
- **Headline:** section headings use the headline role, commonly limited to 18–20 characters. General page titles use the separate page-title role; below the mobile breakpoint they become `2.6rem`.
- **Titles:** workflow labels use `1.15rem`; feature titles use `1.45rem` with `1.25` line-height. Article index titles use `clamp(1.6rem, 3vw, 2.5rem)` and a 30-character measure.
- **Body:** general text uses the body role. Introductory copy uses `1.12rem`; small supporting paragraphs typically use `0.85–0.95rem`. Reading prose has a 72-character maximum and `1.85` line-height. Page introductions stop at 65 characters.
- **Labels:** navigation uses `0.83rem` and weight `600`; buttons use the frontmatter button role. Article tags preserve normal casing and zero tracking. The documentation contents heading is a local uppercase label with `0.08em` tracking.
- **Code:** the sample uses the code role, with tabular line numbers. On small screens code becomes `11px`.

## Layout

Wide marketing content and navigation use a centered maximum width of `1248px`, including `1.5rem` side padding. Reading page introductions, feature content, documentation and the blog index use `1200px`; simple content uses `1000px`, and articles use `860px`. The home opening has a two-column copy composition above the full-width studio. Workflow, use-case and journal groups use three columns; environments and capability rows use two.

Home sections commonly use `6.5rem` vertical padding; tinted environments and use cases use `5.5rem`. Reading sections are ruled, with open padding rather than nested panels. The header is sticky, with `110px` scroll padding and document anchor offset. Documentation uses a `240px` contents column and a flexible main column separated by `3.5rem`; its sidebar is sticky at wide sizes.

At `1000px` and below, desktop navigation becomes a disclosure with a two-column link drawer; home compositions tighten and the closing action stacks. At `700px` and below, the home copy, studio source/output, content grids and Assist example stack into one column; home gutters become `1.25rem`, section rhythm becomes `3.5rem`, and the header's standalone CTA hides. Workflow numbers occupy their own narrow column. The footer goes from four columns to two at `1000px`, then gives its brand a full row at `700px`. The documentation sidebar becomes static below its local `960px` rule; the shared one-column grid applies at `700px`. Article recommendations stack at `680px`; the sitemap directory stacks at `650px`. At `1500px` and above, general page introductions use `7rem` top padding.

Horizontal code overflow remains scrollable. Toolbars, status text, metadata, language links and action rows wrap where appropriate. Preserve logical inline spacing when extending localized surfaces.

## Elevation & Depth

Depth comes mainly from mineral tonal fields, fine borders and the dark source pane beside a light output. The language menu uses `0 12px 32px #172e251c`; the mobile navigation drawer uses `0 16px 24px #172e2510`. These are structural overlays. The studio and Assist frame have no ambient shadow. Reading article and related rows remain flat; source-local hover decorations that are overridden by shared styles are not design authority.

**The Reading Surface Rule.** Use fine rules and open rows for long-form content and article lists; reserve filled rounded surfaces for examples and supporting callouts.

## Shapes

Controls have softly squared corners: button/control (`8px`), tabs (`6px`) and article tags (`4px`). Supporting mini cards, code blocks and preview studies use the surface radius (`12px`); Assist and environment frames use `14px`; the studio and larger reading CTAs use `16px`. Reading rows have square corners and a top rule. Circular step indices and preview status dots are functional accents; concentric rings and slightly rotated CSS file/layout studies provide the artistic detail inside examples.

## Components

### Buttons

Filled emerald controls use white text, a transparent one-pixel border, a minimum height of `46px` and the primary padding in frontmatter. Hover deepens the fill while retaining white text. This foreground also applies inside ruled reading sections. Outline controls use a shared border and transparent background; hover adds soft mint. Ghost controls have no border, a minimum height of `36px` and compact padding; their hover uses soft mint. Within dark code panes, ghost copy controls use light text and a dark green hover field. Disabled UI buttons have `0.5` opacity and no pointer events. There is no separate implemented pressed animation.

All interactive elements inherit a visible emerald outline (`2px`, offset `5px`, radius `4px`) on keyboard focus. The skip link enters view on focus. Background and foreground transitions take `0.18s ease-out`.

### Navigation

The sticky canvas header uses a fine bottom rule and a small outlined GB monogram. Links have a minimum height of `44px`, secondary text at rest, emerald hover/active text and an active underline offset by `8px`. Native disclosure elements control mobile navigation and language menus. Language choices use white menu surfaces, 44px minimum rows and soft mint selected/hover backgrounds. The footer repeats the palette in a soft mint field with language links and restrained separators.

### Tags and reading rows

Article tags are small, noninteractive, soft mint labels with emerald text and normal casing. Article titles precede taxonomy, reading time and description; metadata supports the title. Feature and article collections use open ruled rows; promotional feature badges are absent. Social links and supporting information can use padded mini cards. No marketing input/field component is implemented; do not invent input states from application UI.

### Studio and code sample

The signature studio is a clipped, one-pixel framed stage with a toolbar, selected tab field, dark numbered code pane and matching white output pane. React Aria tabs provide keyboard selection and selected state for HTML/CSS, React and Vue examples. Selection updates source and the corresponding illustrative output together. The framework output includes a working local click counter. The source is safe text, not an executing embedded editor.

Copy uses the shared ghost button and announces success or failure in a status region; it resets after `2500ms` and when source changes. Code is keyboard focusable and scrollable. Selected panels reveal with a `0.35s cubic-bezier(0.16, 1, 0.3, 1)` clip inset from 5% to zero. Reduced motion disables animations, transitions and smooth scrolling globally. Small screens put code above output, cap source height at `230px` and allow the toolbar to wrap.

### Assist and supporting examples

Assist is a static explanatory figure in a bordered white frame, paired with descriptive copy. Its modes are illustrative text, not operable tabs. A soft mint prompt and dark code proposal show the review workflow. CSS-built terminal, file, layout and orbit studies stay within the same palette. Raster imagery is not the signature medium; the existing `tghjkl.jpeg` is retained unchanged with its own provenance sidecar.

## Do's and Don'ts

### Do:

- **Do** use the shared semantic palette across Astro and React components.
- **Do** keep white foregrounds on filled emerald calls to action, including links inside reading sections.
- **Do** place article titles before taxonomy metadata.
- **Do** preserve visible keyboard focus, accessible tab selection and reduced-motion behavior.
- **Do** preserve all existing languages, articles and routes when extending this system.

### Don't:

- **Don’t** reintroduce promotional feature badges into the implemented feature rows.
- **Don’t** introduce a separate library palette or generic icon-tile decoration.
- **Don’t** present illustrative code, terminal or Assist examples as a live editor session.
- **Don’t** infer a visual identity for the separate application from this marketing system.
