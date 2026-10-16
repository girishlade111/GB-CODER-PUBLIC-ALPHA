#!/usr/bin/env node
/**
 * GB Coder — Sitemap Generator
 *
 * Generates public/sitemap.xml covering all 83 canonical public pages
 * (English root and 8 localized variants across 9 languages + 2 English legal documents)
 * with reciprocal xhtml:link hreflang alternates.
 */

import { writeFileSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE_ORIGIN = 'https://code.ladestack.in';
const LASTMOD = '2026-10-15';

const ALL_LANGUAGES = ['en', 'es', 'nl', 'fr', 'ja', 'ko', 'zh', 'ru', 'pt'];

const MULTILINGUAL_BASE_PATHS = [
  '', // Home
  'features',
  'docs',
  'blog',
  'blog/html-css-javascript-live-preview',
  'blog/react-vue-browser-ide',
  'blog/browser-project-backup-restore',
  'about',
  'contact',
];

const LEGAL_BASE_PATHS = [
  'privacy-policy',
  'terms-and-conditions',
];

function getUrl(lang, basePath) {
  const clean = basePath.replace(/^\/+|\/+$/g, '');
  if (lang === 'en') {
    return clean ? `${SITE_ORIGIN}/${clean}` : `${SITE_ORIGIN}/`;
  }
  return clean ? `${SITE_ORIGIN}/${lang}/${clean}` : `${SITE_ORIGIN}/${lang}`;
}

export function generateSitemapXml() {
  const urls = [];

  // 1. Multilingual Pages (9 languages x 9 paths = 81 URLs)
  for (const basePath of MULTILINGUAL_BASE_PATHS) {
    for (const lang of ALL_LANGUAGES) {
      const loc = getUrl(lang, basePath);
      const alternates = ALL_LANGUAGES.map((l) => ({
        lang: l,
        href: getUrl(l, basePath),
      }));
      // x-default points to the English URL
      alternates.push({
        lang: 'x-default',
        href: getUrl('en', basePath),
      });

      const priority = basePath === '' ? (lang === 'en' ? '1.0' : '0.9') : '0.8';

      urls.push({
        loc,
        lastmod: LASTMOD,
        priority,
        alternates,
      });
    }
  }

  // 2. Authoritative Legal Pages (English-only, no fake alternates)
  for (const basePath of LEGAL_BASE_PATHS) {
    urls.push({
      loc: `${SITE_ORIGIN}/${basePath}`,
      lastmod: LASTMOD,
      priority: '0.5',
      alternates: [],
    });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
  xml += `  <!-- GB Coder Multilingual Sitemap (Total URLs: ${urls.length}) -->\n`;

  for (const entry of urls) {
    xml += `  <url>\n`;
    xml += `    <loc>${entry.loc}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    for (const alt of entry.alternates) {
      xml += `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

const xml = generateSitemapXml();
const targetPublic = join(process.cwd(), 'public', 'sitemap.xml');
writeFileSync(targetPublic, xml, 'utf8');
const locCount = (xml.match(/<loc>/g) || []).length;
console.log(`Generated accurate sitemap at public/sitemap.xml (Total URLs: ${locCount})`);

// If dist exists, also copy to dist/sitemap.xml
const targetDist = join(process.cwd(), 'dist', 'sitemap.xml');
if (existsSync(join(process.cwd(), 'dist'))) {
  writeFileSync(targetDist, xml, 'utf8');
  console.log(`Copied sitemap to dist/sitemap.xml`);
}
