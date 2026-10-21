# Public 404 recovery

Target: src/pages/404.astro. Mode: Operate. Preserve the marketing design system and static-host 404 handling. No editor application changes.

## Direction contract
THESIS: A wrong turn with a clear way home, expressed through one oversized, gently drifting typographic 404. Replace competing effects and diagnostic jargon with recovery.
OWN-WORLD: Inherit site.css mineral mint, forest ink, emerald, self-hosted Manrope, softly squared shared buttons, stroke icons and ruled navigation. Light only, matching the marketing site.
STORY: Recognize the missing page, return home or to a same-site previous page, or choose studio, docs or features. Display the requested pathname safely without query parameters.
FIRST VIEWPORT: Compact brand header, centered oversized 404 with an emerald zero and fine directional rule, short heading and explanation, primary home and secondary back action. Quiet links underneath; footer anchors the viewport. Stack actions and destination rows on narrow phones.
FORM: Direct code-led extension of the established world, as pinned by the precise user brief; no concept roll or new identity. Signature motion: the zero floats eight pixels over eight seconds. Staggered entrance completes within 760ms; reduced motion is static.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

No shipping rasters or dependencies added. Verify 360px, 768px and 1280px or wider, real HTTP 404 and noindex, history fallback, keyboard focus, reduced motion, overflow, build and minimal script payload.

## Implementation documentation
- The page imports `src/styles/site.css`: self-hosted Manrope, mineral-mint canvas, forest text, emerald actions, shared focus treatment and button variants remain authoritative. The compact GB mark follows the existing header's 34px/9px badge; the recovery actions use the documented 6px control radius. All arrows use `Icon.astro` and `icons.ts` with the existing 24×24 geometry and 1.75px stroke.
- Oversized numeral composition, ruled destinations and local typography are surface-specific extensions. The requested eight-second zero drift and brief entrance stagger are a scoped exception to the documented Still Surface Rule, not a new global motion policy. Global reduced-motion CSS suppresses transitions/animation; local rules also remove interactive transforms.
- `DESIGN.md` and `.impeccable/design.json` are preserved. Pre-existing drift: their button examples specify 6px corners while shared `.ui-button` CSS uses 8px. Their error typography describes the prior page; the new local heading size and numeral leading are recorded in source rather than promoted to shared tokens. No drift repair, new palette, font, icon family, raster or dependency is part of this change.
- Source review confirms `noindex,follow`, an Astro `/404.html` output contract, pathname-only display through `textContent`, and a home-link fallback for direct/external-history visits. Host status, rendered responsive behavior and browser interactions require the finish verification; source inspection alone does not certify them.

## Finish verification
- Independent finish review disposition: **ship**, with no material findings.
- `npm run build`, `npm run verify:deploy` and `git diff --check` passed. The build retains existing editor chunk/circular-import and browser-data warnings.
- Combined production-preview browser checks passed at 360, 768, 1280 and 1536px: missing URLs return HTTP 404, noindex is present, no horizontal overflow, loaded Manrope and 48px recovery actions. All suggested destinations resolve. Keyboard skip/focus, same-site history, direct-visit fallback, JavaScript-disabled recovery, long paths and reduced motion passed with no browser script errors.
- Local evidence: `.impeccable/review/{mobile,tablet,desktop,wide,reduced-motion}.png` and `verification.json`. Mobile CLS was 0; remaining captures measured below 0.000054. HTML is 5,576 bytes with 321 bytes of inline script. No Lighthouse score comparison or deployed-host check was performed.
