# Marketing UI sources

All adaptations are scoped to the Astro website. Shared colors are defined in
`src/styles/site.css`; the existing IDE is not imported. Every adapted
component consumes the marketing semantic tokens, so no library contributes a
palette of its own.

- [Vibrant Design](https://vibrant.design/): visual research reference for restraint, whitespace and composition; an inspiration directory, not an installable component library. The bento cell grid, hairline panels and pointer-tracked spotlight in `src/styles/canvas.css` follow that direction. No gallery assets are copied.
- [shadcn/ui button](https://ui.shadcn.com/r/styles/new-york/button.json), MIT, shadcn: the variant API and `forwardRef` structure are adapted in `src/components/ui/button.tsx` to semantic CSS instead of Tailwind/Radix Slot. Used by the studio copy control.
- [Kibo UI code block](https://www.kibo-ui.com/r/code-block.json), MIT, Hayden Bleasel: the header/body/copy composition is adapted in `src/components/ui/code-sample.tsx`. No client-side Shiki bundle or broad file-icon map; code is safe React text. The Kibo command-palette and segmented-control patterns are re-expressed in `src/styles/canvas.css` and `src/components/visuals/`.
- [Aceternity tabs](https://ui.aceternity.com/registry/tabs.json), MIT, Manu Arora: the tab row, the shared-element active indicator and the single-panel content switch are adapted in `src/components/ui/studio-tabs.tsx`. The perspective/stack motion is replaced by a reduced-motion-aware reveal and a sliding indicator; the pointer-tracked spotlight pattern follows the same source in `src/styles/canvas.css`.
- [React Aria Components](https://react-aria.adobe.com/Tabs), Apache-2.0, Adobe: installed library supplies the studio's actual tab selection, roving focus, keyboard interaction and `aria-selected`/`aria-controls` wiring.
- [Lucide](https://lucide.dev/), ISC, Lucide Contributors: the 24×24 stroke geometry behind the shared icon registry in `src/components/ui/icons.ts`, drawn once at 1.75px and consumed by both the Astro component (`src/components/ui/Icon.astro`) and the React islands (`src/components/ui/icon.tsx`).
- Manrope Variable, SIL Open Font License: installed via Fontsource and served locally by Astro.

## MIT notices for adapted components

Copyright (c) 2023 shadcn

Copyright (c) Hayden Bleasel

Copyright (c) Manu Arora

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## ISC notice for the icon geometry

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
