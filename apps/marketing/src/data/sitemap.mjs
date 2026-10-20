// Shared by Astro's XML endpoint and the unified deployment generator.
export const SITE_ORIGIN = "https://code.ladestack.in";
export const LANGUAGES = ["en", "es", "nl", "fr", "ja", "ko", "zh", "ru", "pt"];
export const MULTILINGUAL_PATHS = [
  "",
  "features",
  "docs",
  "blog",
  "blog/html-css-javascript-live-preview",
  "blog/react-vue-browser-ide",
  "blog/browser-project-backup-restore",
  "blog/how-gb-coder-works",
  "blog/browser-ide-vs-desktop-ide",
  "blog/browser-ide-github-sync",
  "blog/browser-ide-deploy-vercel-netlify",
  "blog/browser-ide-api-keys-environment-variables",
  "about",
  "contact",
];
export const ENGLISH_PATHS = [
  "privacy-policy",
  "terms-and-conditions",
];

const url = (lang, path) =>
  `${SITE_ORIGIN}${lang === "en" ? "" : `/${lang}`}${path ? `/${path}` : lang === "en" ? "/" : ""}`;
export function generateSitemapXml() {
  const entries = MULTILINGUAL_PATHS.flatMap((path) =>
    LANGUAGES.map((lang) => ({
      loc: url(lang, path),
      alternates: [
        ...LANGUAGES.map((code) => ({ code, href: url(code, path) })),
        { code: "x-default", href: url("en", path) },
      ],
    })),
  );
  entries.push(
    ...ENGLISH_PATHS.map((path) => ({ loc: url("en", path), alternates: [] })),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.map((entry) => `  <url>\n    <loc>${entry.loc}</loc>\n${entry.alternates.map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.code}" href="${alt.href}" />\n`).join("")}  </url>`).join("\n")}\n</urlset>\n`;
}
