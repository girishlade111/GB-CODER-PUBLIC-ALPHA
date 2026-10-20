---
name: GB Coder Marketing
description: A mineral mint working canvas for browser development.
colors:
  canvas: "#f5f8f6"
  surface: "#ffffff"
  surface-soft: "#e8f0eb"
  surface-raised: "#ffffff"
  border: "#ccd9d1"
  border-subtle: "#dfe7e2"
  text-primary: "#172e25"
  text-secondary: "#506258"
  text-muted: "#627268"
  primary: "#176644"
  accent-hover: "#104c33"
  accent-dark: "#172e25"
  code-bg: "#152b23"
  code-text: "#e4f1e9"
  grid-dot: "rgba(23, 102, 68, 0.1)"
  grid-line: "rgba(23, 102, 68, 0.035)"
  code-border: "#1e382b"
  code-muted: "#9cb8a9"
  code-dim: "#557867"
  code-ghost: "#c9e0d3"
  code-panel: "#d5e2da"
  chrome-close: "#ff5f56"
  chrome-close-edge: "#e0443e"
  chrome-minimize: "#ffbd2e"
  chrome-minimize-edge: "#dea123"
  chrome-maximize: "#27c93f"
  chrome-maximize-edge: "#1aab29"
  syntax-key: "#f07178"
  syntax-string: "#c3e88d"
  syntax-const: "#82aaff"
  syntax-comment: "#9bbca7"
typography:
  display:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "clamp(3rem, 5.5vw, 4.8rem)"
    fontWeight: 550
    lineHeight: 1.14
    letterSpacing: "-0.035em"
  page-title:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "clamp(2.5rem, 5.5vw, 4.75rem)"
    fontWeight: 550
    lineHeight: 1.14
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "clamp(2rem, 3.3vw, 2.85rem)"
    fontWeight: 550
    lineHeight: 1.14
    letterSpacing: "-0.035em"
  body:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "1rem"
    lineHeight: 1.65
  label:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "0.85rem"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "0.7rem"
    fontWeight: 600
    lineHeight: 1.4
  meta:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "0.92rem"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "1.12rem"
    fontWeight: 400
    lineHeight: 1.6
  title:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "1.15rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  status:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "0.8rem"
    fontWeight: 600
    lineHeight: 1.4
  card-title:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
  stat-value:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "1.6rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  button:
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif'
    fontSize: "0.88rem"
    fontWeight: 650
    lineHeight: 1.4
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "12px"
    lineHeight: 1.85
rounded:
  micro: "3px"
  tag: "4px"
  inset: "5px"
  control: "6px"
  field: "7px"
  badge: "9px"
  surface: "8px"
  field-lg: "10px"
  surface-lg: "12px"
  panel: "14px"
  stage: "16px"
  chip: "9999px"
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
    textColor: "{colors.text-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0.35rem 0.65rem"
  tab-indicator:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
  article-tag:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.tag}"
    padding: "0.2rem 0.55rem"
  bento-cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.panel}"
    padding: "1.9rem"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.panel}"
  code-sample:
    backgroundColor: "{colors.code-bg}"
    textColor: "{colors.code-text}"
    typography: "{typography.code}"
    rounded: "{rounded.surface}"
---

# Design System: GB Coder Marketing

## Overview

**Creative North Star: "The Working Canvas"**

A browser development studio presented as a working canvas. Pale mineral mint space, deep forest ink and emerald actions let code and its visible result lead. The page is the proof: a real editor frame, a real command palette, a real file tree, a real live preview — each one composed in CSS rather than photographed.

The system is quiet by construction. Surfaces are separated by hairline rules and tonal fields, not by heavy cards. Reading rows stay open and ruled; filled rounded surfaces are reserved for things that behave like objects (the studio frame, the palette, the segmented control, the chips). One emerald accent carries every action, every selected state and every active rule, and it appears on less than a tenth of any screen.

Self-hosted Manrope keeps the voice modern and professional; a system monospace marks code, paths and measurements. Rounded controls are softly squared rather than pill-shaped, so the studio chrome reads as tooling and not as a consumer app.

This document records the implemented system. The separate editor application is outside its boundary and contributes no visual identity here.

**Key Characteristics:**

- App proof over marketing illustration
- One mineral mint and emerald palette across every surface
- Hairline rules and open rows instead of nested card stacks
- A single drawn icon system: 24×24 grid, 1.75px stroke
- Accessible tab semantics and keyboard selection in the studio

## Colors

A single low-saturation green ground, a forest ink family and one concentrated emerald action color.

### Primary

- **Emerald (`primary`, `#176644`)**: filled actions, selected tabs, reading links, active capability icons and the small status dot on each marquee chip. Hover deepens to **Deep Forest (`accent-hover`, `#104c33`)**. The legacy `accent-terracotta` variable is a compatibility alias for emerald, never a second warm accent.

### Neutral

- **Mineral Mint (`canvas`, `#f5f8f6`)**: the page ground.
- **Paper (`surface`, `#ffffff`)**: every raised or object-like surface — studio frame, palette, bento cells, code-adjacent panels.
- **Soft Mint (`surface-soft`, `#e8f0eb`)**: quiet tonal fills for the tab rail, code-window chrome, language boxes and hover states.
- **Forest Ink (`text-primary`, `#172e25`)**: headings and primary prose.
- **Secondary Foliage (`text-secondary`, `#506258`)**: supporting prose, navigation, captions.
- **Muted Foliage (`text-muted`, `#627268`)**: metadata, timestamps, status text.
- **Rule (`border`, `#ccd9d1`)** and **Hairline (`border-subtle`, `#dfe7e2`)**: structural rows versus dividers.
- **Deep Forest (`accent-dark`, `#172e25`)**: the darkest plane, used for code chrome.

### Dark Plane

- **Ink Code (`code-bg`, `#152b23`)** with **Mint Code (`code-text`, `#e4f1e9`)**: the source pane of the studio and the IDE proof frame. The only dark surface on the site.
- **Code Rule (`code-border`, `#1e382b`)**, **Code Muted (`code-muted`, `#9cb8a9`)**, **Code Dim (`code-dim`, `#557867`)** and **Code Ghost (`code-ghost`, `#c9e0d3`)**: the hairlines, secondary text, line numbers and ghost-control text inside that plane. Every dark code surface on the site resolves to this one family.
- **Code Panel (`code-panel`, `#d5e2da`)**: the neutral bar of the preview pane.

### Two Named Exceptions

**The Chrome Traffic Light Rule.** The studio and IDE frames carry three 10px window dots — **Close (`chrome-close`, `#ff5f56`)**, **Minimize (`chrome-minimize`, `#ffbd2e`)** and **Maximize (`chrome-maximize`, `#27c93f`)**, each with a darker rim. They are the one place on the site that carries foreign hues, and they earn it: they are what makes a CSS-built frame read as a real editor window rather than a diagram. They never appear as UI accent, never scale past 10px and never animate.

**The Syntax Palette Rule.** Source samples are tinted with exactly four syntax colors — **Key (`syntax-key`, `#f07178`)**, **String (`syntax-string`, `#c3e88d`)**, **Constant (`syntax-const`, `#82aaff`)** and **Comment (`syntax-comment`, `#9bbca7`)**. They describe code, not the product, and they never leak into a page background, a control or a heading.

### Named Rules

**The Shared Palette Rule.** Every adapted library component consumes the marketing semantic tokens. A second palette never enters the site, and no component carries its own accent color.

**The One Accent Rule.** Emerald is the only chroma. It marks actions, selection and active state, and nothing else. Its rarity is the point.

**The Hairline Rule.** Structure is expressed with 1px rules and tonal fields. A shadow alone never carries a layout decision.

## Typography

**Display Font:** Manrope Variable (with Segoe UI and sans-serif fallbacks), self-hosted through Fontsource.
**Body Font:** the same Manrope Variable.
**Label/Mono Font:** system monospace, reserved for code, file paths, terminal output and tabular numerals.

**Character:** a single geometric-humanist face at every level, calm and compact at large sizes, precise at small sizes. Monospace appears only where the content is genuinely code or measurement.

### Hierarchy

- **Display** (weight 550, `clamp(3rem, 5.5vw, 4.8rem)`, line-height 1.14, tracking `-0.035em`): the home title only. It breaks to three lines at 1440px and to `clamp(2.8rem, 12vw, 4.2rem)` below 700px.
- **Page Title** (weight 550, `clamp(2.5rem, 5.5vw, 4.75rem)`): inner-page titles, e.g. Features, Docs, Blog.
- **Headline** (weight 550, `clamp(2rem, 3.3vw, 2.85rem)`): section headings on the home page.
- **Title** (weight 600, `1.12rem`, tracking `-0.02em`): bento and ruling cell titles; `1.5rem` inside feature detail rows.
- **Body** (weight 400, `1rem`, line-height 1.65): default prose. Reading copy is capped at 65–72 characters per line and set at line-height 1.85; page introductions stop at 65 characters.
- **Label** (weight 600, `0.85rem`): navigation and column titles. Status and category labels drop to `0.72–0.8rem`.
- **Button** (weight 650, `0.88rem`): every control.
- **Code** (12px, line-height 1.85, tabular line numbers): the studio source pane and code blocks; 11–11.5px inside the IDE proof frame.

### Named Rules

**The Tracking Floor Rule.** Headings never track below `-0.035em`. Body copy and labels track at zero.

**The One Measure Rule.** Prose never exceeds 72 characters. A measure that gets wider is a measure that stops being read.

## Layout

Content is centered on a 1248px container with 1.5rem gutters. Inner pages use 1200px for hero and grid content, 1000px for prose documents, 860px for articles, and 1100px for the blog index. The home opening is a two-column copy composition above a full-width studio stage; the workflow, use-case and journal groups are ruled rows rather than card grids.

Vertical rhythm is generous: home sections sit at 4.5rem top padding, page heroes at `clamp(3rem, 7vw, 7rem)`. Reading sections are ruled and open — no nested panels.

At 1000px the desktop navigation becomes a disclosure drawer, the opening copy and the closing action stack, and the bento grid halves its spans. At 700px the studio stage puts code above output, the bento collapses to one column, the marquee band tightens, the page title drops to 2.6rem and the footer's brand takes a full row. At 1500px and above, page heroes gain top padding.

## Elevation & Depth

Depth is tonal. Paper surfaces sit on the mineral ground and are separated by hairlines; soft-mint fills mark recessed regions; the dark code plane supplies the single sharp contrast on the page. Shadows are structural, reserved for objects that float above the page or for state changes.

### Shadow Vocabulary

- **Lift** (`0 1px 2px rgba(23, 46, 37, 0.04)`): resting raised surfaces.
- **Hover** (`0 4px 16px -2px rgba(23, 46, 37, 0.06), 0 1px 3px rgba(23, 46, 37, 0.03)`): a surface that answers the pointer.
- **Float** (`0 12px 32px -8px #172e251c, 0 2px 6px rgba(23, 46, 37, 0.03)`): overlays — language menu, command palette.
- **Stage** (`0 24px 64px -16px rgba(23, 78, 55, 0.16), 0 2px 4px rgba(23, 46, 37, 0.04)`): the studio and IDE proof frames, the only wide shadow in the system.

### Named Rules

**The Ambient Rule.** Every shadow carries an offset and a soft blur. A zero-offset halo is decoration, not depth.

**The Restrained Shadow Rule.** At most one stage-level shadow is visible in a viewport. Shadows never stack.

## Shapes

Corners are softly squared: 4px for tags, 6px for controls and the tab rail, 8px for surfaces and code blocks, 14px for panels and app frames, 16px for the studio stage, and fully round only for pills, chips and status dots. Rows in reading sections have square corners and a top rule.

The signature geometry is built rather than decorated: a dot-grid and two soft aurora pools form the hero backdrop, an orbiting ring pair marks the sample preview, a file tree and a split editor form the IDE proof frame. Nothing uses a geometric mask to stand in for a photographic subject, and the site ships no raster photography.

### Named Rules

**The One Radius Language Rule.** Every radius comes from the documented scale. A new corner value is a design-system decision, not a local choice.

## Components

### Buttons

- **Shape:** 6px radius, minimum height 46px for primary and outline, 36px for ghost.
- **Primary:** emerald fill (`#176644`), white text, transparent 1px border, `0.7rem 1.3rem` padding.
- **Hover / Focus:** the fill deepens to `#104c33`; white text is retained in every state, including links inside reading sections. Focus is a visible 2px emerald outline with 5px offset.
- **Outline:** transparent fill, shared hairline border, forest-ink text; hover adds a soft-mint field.
- **Ghost:** no border, `0.35rem 0.65rem` padding; hover adds soft mint.

### Icon System

One registry (`components/ui/icons.ts`) feeds both the Astro component and the React islands. Every glyph is drawn on a 24×24 grid with a 1.75px stroke, round caps and round joins, and inherits `currentColor`. Icons are decorative by default and take a `label` when they carry meaning. No emoji and no Unicode glyph stand in for an icon anywhere on the site.

### Navigation

A sticky canvas header with a hairline bottom rule, an outlined GB monogram and 44px minimum link targets. Links rest in secondary foliage and turn emerald on hover and when active. The language switcher and the mobile menu are native `<details>` disclosures, so they work with no JavaScript.

### Tabs (Studio)

The studio tab rail is a soft-mint segmented control with a sliding white indicator. Selection, roving focus and keyboard operation come from React Aria's `Tabs`; the indicator is measured from the selected tab and slides on a `0.34s` exponential ease-out. Before hydration the selected tab carries its own surface fill, so the control never flashes unstyled. Reduced motion removes the slide and the panel reveal.

### Cards and Rows

- **Bento cells:** 14px radius, white surface, `1.9rem` padding, minimum 180px tall, separated by 1px gaps over a hairline field. A pointer-tracked emerald spotlight fades in under the cursor.
- **Ruled rows:** square corners, open padding, a top rule and a hairline beneath. Used for the workflow, the journal and the environment notes.
- **Panels:** 14px radius, hairline border, no shadow at rest.
- **Tags:** 4px radius, soft-mint field, emerald text, normal casing, never interactive.

### Code

Source is shown in the dark code plane with tabular line numbers. The code block keeps the Kibo header-and-copy composition: a filename with a leading glyph, a ghost copy button, and a live status region that announces success or failure and resets after 2.5 seconds. The sample code is safe text, never an executing editor.

### App Proof

The IDE frame, command palette and segmented environment switch are CSS-composed, not screenshots. The command palette is a real focusable list of commands with an active row; the segmented control is a CSS-only radio group with a checked-state surface.

### Inputs and Fields

One field pattern exists: the sitemap filter. A 10px-radius white field on the mineral ground with a hairline border, a leading search glyph, and a focus state that swaps the border to emerald with a 3px hairline halo.

## Do's and Don'ts

### Do:

- **Do** use the shared semantic tokens in every Astro page, React island and adapted library component.
- **Do** draw icons from the shared registry so stroke weight never drifts.
- **Do** keep white foregrounds on filled emerald calls to action, including links inside reading sections.
- **Do** place titles before taxonomy metadata, and let a heading carry its own weight without a label above it.
- **Do** preserve visible keyboard focus, real tab semantics and reduced-motion behavior.
- **Do** preserve all nine languages, every article and every route when extending the system.

### Don't:

- **Don't** reintroduce kickers, eyebrows or other labels above a heading.
- **Don't** introduce a second accent, a second icon weight or a per-library palette.
- **Don't** use emoji, Unicode glyphs or a second icon family as decoration.
- **Don't** present illustrative code, the terminal study or the IDE frame as a live session.
- **Don't** stack filled rounded surfaces inside each other; use rules for reading content.
- **Don't** infer a visual identity for the separate application from this marketing system.
