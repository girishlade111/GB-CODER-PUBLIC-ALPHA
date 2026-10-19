# Marketing UI sources

All adaptations are scoped to this Astro website. Shared colors are defined in `src/styles/site.css`; the existing IDE is not imported.

- [Vibrant Design](https://vibrant.design/): visual research reference for restraint, whitespace and composition; an inspiration directory, not an installable component library. No gallery assets are copied.
- [shadcn/ui button](https://ui.shadcn.com/r/styles/new-york/button.json), MIT, shadcn: variant API and forwardRef structure adapted in `src/components/ui/button.tsx` to semantic CSS instead of Tailwind/Radix Slot.
- [Kibo UI code block](https://www.kibo-ui.com/r/code-block.json), MIT, Hayden Bleasel: header/body/copy composition adapted in `src/components/ui/code-sample.tsx`. No client-side Shiki bundle or broad file-icon map; code is safe React text.
- [Aceternity tabs](https://ui.aceternity.com/registry/tabs.json), MIT, Manu Arora: tab/panel composition adapted in `src/components/StudioDemo.tsx`; replaces perspective/stack motion with a reduced-motion-aware reveal and React Aria semantics.
- [React Aria Components](https://react-aria.adobe.com/Tabs), Apache-2.0, Adobe: installed library supplies actual tab selection, focus management and keyboard interactions.
- Manrope Variable, SIL Open Font License: installed via Fontsource and served locally by Astro.

## MIT notices for adapted components

Copyright (c) 2023 shadcn

Copyright (c) Hayden Bleasel

Copyright (c) Manu Arora

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
