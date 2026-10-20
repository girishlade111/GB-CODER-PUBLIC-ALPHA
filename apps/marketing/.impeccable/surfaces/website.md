# Marketing website
Mode: Persuade on home/features; Read on guides, articles and directory.

## Direction contract
THESIS: A browser development studio presented as a working canvas: code and its visible result are the central proof, followed by clear choices of workflow.
OWN-WORLD: Pale mineral mint, deep forest ink, emerald actions, generous whitespace, self-hosted Manrope, fine rules and restrained rounded controls. Every library consumes the same semantic tokens.
STORY: Understand browser coding, explore static and framework examples, choose the relevant environment, read a guide, open the existing app.
FIRST VIEWPORT: Oversized left-aligned headline above a wide interactive code-to-preview stage; one primary action beside the supporting copy. The sample is explicitly illustrative. No invented metrics, no kicker above the heading, no icon tiles.
FORM: Product canvas, chosen directly from the user's minimal and artistic brief, the existing website and supplied design references. No concept roll was run and no seed key, decision comp or QUALITY BAR image exists. This session substitutes a written direction and independent review of the rendered website; it does not claim the skill's concept-selection workflow was completed. Signature interaction: accessible tabs switch a source snippet and its matching rendered preview together. Reduced motion removes the panel reveal.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Execution: code-first for this session; user preference remains unrecorded pending the optional question. No generated shipping raster is required.

## Implemented expression (refreshed 2026-10-20)
- **Studio:** the hero stage is a hydrated React island. Tabs are Aceternity's tab-row and shared-element indicator adapted to React Aria's `Tabs`, so selection, roving focus and arrow-key operation are real, and the active pill slides between examples on a reduced-motion-aware reveal. The source pane is Kibo's code-block composition and the copy control is shadcn's button, both consuming the marketing tokens.
- **App proof:** a CSS-composed IDE frame, command palette, file tree and segmented environment switch replace illustration. Nothing in the site is presented as a live session.
- **Icon system:** one registry in `components/ui/icons.ts`, 24×24 grid at a 1.75px stroke, consumed by both the Astro component and the React islands. Emoji and Unicode glyphs are gone from every surface, including the human-readable directory.
- **Reading surfaces:** ruled editorial rows, hairline panels and a 14px radius for objects. Long-form content never nests filled cards.
- **Kickers and eyebrows are not part of this world.** A heading carries its own weight; no label sits above it.

## Library allocation
- Vibrant: composition reference only (bento grid, hairline panels, pointer-tracked spotlight) — an inspiration directory, not an installable library.
- Aceternity: tab composition and the spotlight pattern, both re-expressed in the site's own tokens.
- shadcn/ui: the button variant API, adapted to semantic CSS.
- Kibo UI: the code-block, command-palette and segmented-control compositions.
- React Aria: the installed library that supplies the studio's real tab semantics.
- Lucide: the geometry behind the single shared icon registry.
