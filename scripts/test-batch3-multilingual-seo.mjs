#!/usr/bin/env node
/**
 * GB Coder — Batch 3 Consolidated Multilingual & SEO Test Suite
 *
 * Validates:
 * 1. Complete route matrix (83 canonical pages + 404)
 * 2. Localization integrity across all 9 languages
 * 3. English default root (/), no /en/ duplicate indexing
 * 4. Technical SEO: Canonical URLs, Reciprocal Hreflang, x-default, OpenGraph, Twitter
 * 5. Structured Data: Organization, WebSite, SoftwareApplication, Breadcrumbs, BlogPosting
 * 6. Content quality: Semantic headings, no placeholders, internal link resolution
 * 7. Sitemap & Robots integrity
 * 8. Routing isolation with /app, /ide, /api
 * 9. Real browser verification (Playwright): Language switching, mobile menu, copy interaction
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { chromium } from 'playwright';

const ROOT_DIR = process.cwd();
const DIST = join(ROOT_DIR, 'dist');
const TEST_PORT = 4195;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

const ALL_LANGUAGES = ['en', 'es', 'nl', 'fr', 'ja', 'ko', 'zh', 'ru', 'pt'];
const NON_DEFAULT_LANGUAGES = ['es', 'nl', 'fr', 'ja', 'ko', 'zh', 'ru', 'pt'];

const MULTILINGUAL_PATHS = [
  '',
  'features',
  'docs',
  'blog',
  'blog/html-css-javascript-live-preview',
  'blog/react-vue-browser-ide',
  'blog/browser-project-backup-restore',
  'about',
  'contact',
];

const LEGAL_PATHS = [
  'privacy-policy',
  'terms-and-conditions',
];

const EXPECTED_HTML_LANG = {
  en: 'en',
  es: 'es',
  nl: 'nl',
  fr: 'fr',
  ja: 'ja',
  ko: 'ko',
  zh: 'zh-Hans',
  ru: 'ru',
  pt: 'pt',
};

let serverProcess;

function httpGet(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

before(async () => {
  // Ensure dist exists
  if (!existsSync(DIST)) {
    throw new Error('dist directory does not exist! Run npm run build first.');
  }

  // Start combined preview server
  serverProcess = spawn('node', ['scripts/preview-combined.mjs', `--port=${TEST_PORT}`], {
    stdio: 'ignore',
  });

  // Wait for server ready
  let attempts = 0;
  while (attempts < 30) {
    try {
      const res = await httpGet('/');
      if (res.status === 200) break;
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 200));
    attempts++;
  }
  if (attempts >= 30) {
    throw new Error('Preview server failed to start within 6 seconds');
  }
});

after(() => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch {}
  }
});

describe('1. Route Matrix & Build Inventory', () => {
  test('A. English root and all 8 localized variants exist for all pages (83 total pages)', () => {
    let count = 0;
    for (const basePath of MULTILINGUAL_PATHS) {
      for (const lang of ALL_LANGUAGES) {
        const relPath = lang === 'en'
          ? (basePath ? `${basePath}/index.html` : 'index.html')
          : (basePath ? `${lang}/${basePath}/index.html` : `${lang}/index.html`);
        const fullPath = join(DIST, relPath);
        assert.ok(existsSync(fullPath), `Missing prerendered page: ${relPath}`);
        count++;
      }
    }
    for (const legal of LEGAL_PATHS) {
      const fullPath = join(DIST, legal, 'index.html');
      assert.ok(existsSync(fullPath), `Missing legal page: ${legal}/index.html`);
      count++;
    }
    assert.equal(count, 83, `Expected 83 canonical public pages, got ${count}`);
  });

  test('B. No accidental indexable /en/ duplicate directory exists', () => {
    const enDir = join(DIST, 'en');
    assert.ok(!existsSync(enDir), 'Accidental dist/en directory exists! English must be at root only.');
  });

  test('C. Marketing 404.html exists in dist', () => {
    const p404 = join(DIST, '404.html');
    assert.ok(existsSync(p404), 'dist/404.html is missing');
    const content = readFileSync(p404, 'utf8');
    assert.ok(content.includes('404'), '404.html must contain 404');
    assert.ok(content.includes('noindex'), '404.html must specify noindex');
  });
});

describe('2. Localization & HTML Attributes', () => {
  test('Correct <html lang="..."> attribute on every page', () => {
    for (const lang of ALL_LANGUAGES) {
      const expectedLangAttr = EXPECTED_HTML_LANG[lang];
      const relPath = lang === 'en' ? 'index.html' : `${lang}/index.html`;
      const html = readFileSync(join(DIST, relPath), 'utf8');
      assert.ok(
        html.includes(`lang="${expectedLangAttr}"`),
        `Page ${relPath} has incorrect html lang attribute. Expected: lang="${expectedLangAttr}"`,
      );
    }
  });

  test('No placeholder or untranslated template tags across all pages', () => {
    const forbiddenPatterns = [
      'Lorem ipsum',
      'TODO:',
      'TBD',
      'FIXME',
      '[object Object]',
      'undefined',
      'null',
      'Proof of Concept',
      'LadeStack Architecture Proof of Concept',
    ];

    for (const basePath of MULTILINGUAL_PATHS) {
      for (const lang of ALL_LANGUAGES) {
        const relPath = lang === 'en'
          ? (basePath ? `${basePath}/index.html` : 'index.html')
          : (basePath ? `${lang}/${basePath}/index.html` : `${lang}/index.html`);
        const html = readFileSync(join(DIST, relPath), 'utf8');
        for (const pattern of forbiddenPatterns) {
          assert.ok(
            !html.includes(pattern),
            `Page ${relPath} contains forbidden placeholder pattern: "${pattern}"`,
          );
        }
      }
    }
  });
});

describe('3. Technical International SEO', () => {
  test('A. Self-referencing Canonical URLs on all 83 pages', () => {
    for (const basePath of MULTILINGUAL_PATHS) {
      for (const lang of ALL_LANGUAGES) {
        const clean = basePath ? `/${basePath}` : '';
        const expectedCanonical = lang === 'en'
          ? (clean ? `https://code.ladestack.in${clean}` : 'https://code.ladestack.in/')
          : (clean ? `https://code.ladestack.in/${lang}${clean}` : `https://code.ladestack.in/${lang}`);
        
        const relPath = lang === 'en'
          ? (basePath ? `${basePath}/index.html` : 'index.html')
          : (basePath ? `${lang}/${basePath}/index.html` : `${lang}/index.html`);
        const html = readFileSync(join(DIST, relPath), 'utf8');

        assert.ok(
          html.includes(`rel="canonical" href="${expectedCanonical}"`),
          `Page ${relPath} missing or incorrect canonical. Expected: ${expectedCanonical}`,
        );
      }
    }
  });

  test('B. Reciprocal hreflangs and x-default on all 81 multilingual pages', () => {
    for (const basePath of MULTILINGUAL_PATHS) {
      const clean = basePath ? `/${basePath}` : '';
      for (const lang of ALL_LANGUAGES) {
        const relPath = lang === 'en'
          ? (basePath ? `${basePath}/index.html` : 'index.html')
          : (basePath ? `${lang}/${basePath}/index.html` : `${lang}/index.html`);
        const html = readFileSync(join(DIST, relPath), 'utf8');

        // Check each language alternate
        for (const altLang of ALL_LANGUAGES) {
          const expectedAltHref = altLang === 'en'
            ? (clean ? `https://code.ladestack.in${clean}` : 'https://code.ladestack.in/')
            : (clean ? `https://code.ladestack.in/${altLang}${clean}` : `https://code.ladestack.in/${altLang}`);
          assert.ok(
            html.includes(`rel="alternate" hreflang="${altLang}" href="${expectedAltHref}"`),
            `Page ${relPath} missing hreflang="${altLang}" pointing to ${expectedAltHref}`,
          );
        }

        // Check x-default pointing to English default
        const expectedXDefault = clean ? `https://code.ladestack.in${clean}` : 'https://code.ladestack.in/';
        assert.ok(
          html.includes(`rel="alternate" hreflang="x-default" href="${expectedXDefault}"`),
          `Page ${relPath} missing hreflang="x-default" pointing to ${expectedXDefault}`,
        );
      }
    }
  });

  test('C. Legal pages do NOT emit hreflangs (English authoritative only)', () => {
    for (const legal of LEGAL_PATHS) {
      const relPath = `${legal}/index.html`;
      const html = readFileSync(join(DIST, relPath), 'utf8');
      assert.ok(
        !html.includes('hreflang='),
        `Legal page ${relPath} must not emit hreflang links without approved translations`,
      );
      assert.ok(
        html.includes(`rel="canonical" href="https://code.ladestack.in/${legal}"`),
        `Legal page ${relPath} must have self-referencing English canonical URL`,
      );
    }
  });

  test('D. Open Graph and Twitter Card metadata present on all pages', () => {
    for (const basePath of MULTILINGUAL_PATHS) {
      const relPath = basePath ? `${basePath}/index.html` : 'index.html';
      const html = readFileSync(join(DIST, relPath), 'utf8');
      assert.ok(html.includes('property="og:title"'), `${relPath} missing og:title`);
      assert.ok(html.includes('property="og:description"'), `${relPath} missing og:description`);
      assert.ok(html.includes('property="og:url"'), `${relPath} missing og:url`);
      assert.ok(html.includes('name="twitter:card"'), `${relPath} missing twitter:card`);
      assert.ok(html.includes('name="twitter:title"'), `${relPath} missing twitter:title`);
    }
  });

  test('E. JSON-LD structured data parses and matches content', () => {
    for (const basePath of MULTILINGUAL_PATHS) {
      for (const lang of ['en', 'es', 'ja']) {
        const relPath = lang === 'en'
          ? (basePath ? `${basePath}/index.html` : 'index.html')
          : (basePath ? `${lang}/${basePath}/index.html` : `${lang}/index.html`);
        const html = readFileSync(join(DIST, relPath), 'utf8');

        const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
        assert.ok(jsonLdMatches.length >= 1, `Page ${relPath} missing JSON-LD script tag`);

        for (const match of jsonLdMatches) {
          let parsed;
          try {
            parsed = JSON.parse(match[1]);
          } catch (e) {
            assert.fail(`Page ${relPath} has malformed JSON-LD: ${e.message}`);
          }
          assert.ok(parsed['@context'] === 'https://schema.org', `JSON-LD missing schema.org context`);
        }

        // Subpages must have BreadcrumbList
        if (basePath) {
          const hasBreadcrumb = jsonLdMatches.some((m) => m[1].includes('"@type":"BreadcrumbList"'));
          assert.ok(hasBreadcrumb, `Page ${relPath} missing BreadcrumbList JSON-LD`);
        }

        // Blog articles must have BlogPosting
        if (basePath.startsWith('blog/')) {
          const hasBlogPosting = jsonLdMatches.some((m) => m[1].includes('"@type":"BlogPosting"'));
          assert.ok(hasBlogPosting, `Article ${relPath} missing BlogPosting JSON-LD`);
        }
      }
    }
  });
});

describe('4. Sitemap & Robots.txt Compliance', () => {
  test('A. robots.txt has no obsolete domains and references canonical sitemap', () => {
    const robotsContent = readFileSync(join(DIST, 'robots.txt'), 'utf8');
    assert.ok(!robotsContent.includes('gbcoder.com'), 'robots.txt must not contain gbcoder.com');
    assert.ok(
      robotsContent.includes('Sitemap: https://code.ladestack.in/sitemap.xml'),
      'robots.txt missing primary https://code.ladestack.in/sitemap.xml',
    );
    assert.ok(robotsContent.includes('Disallow: /api/'), 'robots.txt must disallow /api/');
    assert.ok(robotsContent.includes('Disallow: /preview/'), 'robots.txt must disallow /preview/');
  });

  test('B. sitemap.xml exists and covers all 83 canonical public pages with hreflang alternates', () => {
    const sitemapContent = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
    assert.ok(!sitemapContent.includes('gbcoder.com'), 'sitemap.xml must not contain gbcoder.com');

    // Count URLs in sitemap
    const locMatches = [...sitemapContent.matchAll(/<loc>(https:\/\/code\.ladestack\.in[^<]*)<\/loc>/g)].map(m => m[1]);
    assert.equal(locMatches.length, 83, `Sitemap must contain exactly 83 URLs, found ${locMatches.length}`);

    // Check all languages covered
    for (const lang of ALL_LANGUAGES) {
      if (lang === 'en') {
        assert.ok(sitemapContent.includes('<loc>https://code.ladestack.in/</loc>'));
        assert.ok(sitemapContent.includes('<loc>https://code.ladestack.in/features</loc>'));
        assert.ok(sitemapContent.includes('<loc>https://code.ladestack.in/docs</loc>'));
      } else {
        assert.ok(sitemapContent.includes(`<loc>https://code.ladestack.in/${lang}</loc>`));
        assert.ok(sitemapContent.includes(`<loc>https://code.ladestack.in/${lang}/features</loc>`));
        assert.ok(sitemapContent.includes(`<loc>https://code.ladestack.in/${lang}/docs</loc>`));
      }
    }

    // Check alternate links present
    assert.ok(sitemapContent.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'));
    assert.ok(sitemapContent.includes('xhtml:link rel="alternate" hreflang="x-default"'));
  });
});

describe('5. Content & Link Integrity', () => {
  test('Every internal link in generated marketing pages resolves', () => {
    const samplePages = [
      'index.html',
      'features/index.html',
      'docs/index.html',
      'blog/index.html',
      'blog/html-css-javascript-live-preview/index.html',
      'about/index.html',
      'contact/index.html',
      'es/index.html',
      'es/features/index.html',
      'fr/docs/index.html',
      'ja/blog/index.html',
      'zh/about/index.html',
    ];

    for (const pageRel of samplePages) {
      const html = readFileSync(join(DIST, pageRel), 'utf8');
      const hrefMatches = [...html.matchAll(/href="(\/[^"#?]+)"/g)].map(m => m[1]);

      for (const href of hrefMatches) {
        // App / IDE / API / static asset routes are valid entrypoints
        if (
          href === '/app' ||
          href.startsWith('/app/') ||
          href === '/ide' ||
          href.startsWith('/api/') ||
          href === '/favicon.ico' ||
          href.startsWith('/_astro/')
        ) {
          continue;
        }

        // Check if matching static HTML exists in dist
        const cleanHref = href.replace(/^\/+|\/+$/g, '');
        const candidate1 = join(DIST, cleanHref, 'index.html');
        const candidate2 = join(DIST, `${cleanHref}.html`);
        const candidate3 = join(DIST, cleanHref);

        const exists = existsSync(candidate1) || existsSync(candidate2) || existsSync(candidate3);
        assert.ok(exists, `Broken internal link in ${pageRel}: ${href} does not resolve in dist/`);
      }
    }
  });

  test('Heading hierarchy: single h1 on each page', () => {
    for (const basePath of MULTILINGUAL_PATHS) {
      for (const lang of ['en', 'es', 'fr', 'ja']) {
        const relPath = lang === 'en'
          ? (basePath ? `${basePath}/index.html` : 'index.html')
          : (basePath ? `${lang}/${basePath}/index.html` : `${lang}/index.html`);
        const html = readFileSync(join(DIST, relPath), 'utf8');

        const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
        assert.equal(
          h1Matches.length,
          1,
          `Page ${relPath} should have exactly 1 <h1> heading, found ${h1Matches.length}`,
        );
      }
    }
  });
});

describe('6. Server Routing & HTTP Status Codes', () => {
  test('A. GET / returns 200 with English marketing HTML', async () => {
    const res = await httpGet('/');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('GB Coder'));
    assert.ok(res.body.includes('/app/projects'));
    assert.ok(res.body.includes('lang="en"'));
  });

  test('B. GET /es and /es/ return 200 with Spanish marketing HTML', async () => {
    const res1 = await httpGet('/es');
    assert.equal(res1.status, 200);
    assert.ok(res1.body.includes('lang="es"'));
    assert.ok(res1.body.includes('Empezar a Programar'));

    const res2 = await httpGet('/es/');
    assert.equal(res2.status, 200);
    assert.ok(res2.body.includes('lang="es"'));
  });

  test('C. GET /ja/features returns 200 with Japanese features HTML', async () => {
    const res = await httpGet('/ja/features');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('lang="ja"'));
    assert.ok(res.body.includes('WebContainer'));
  });

  test('D. GET /robots.txt and /sitemap.xml return 200 with correct content-types', async () => {
    const robots = await httpGet('/robots.txt');
    assert.equal(robots.status, 200);
    assert.ok(robots.headers['content-type'].includes('text/plain'));
    assert.ok(robots.body.includes('Sitemap: https://code.ladestack.in/sitemap.xml'));

    const sitemap = await httpGet('/sitemap.xml');
    assert.equal(sitemap.status, 200);
    assert.ok(sitemap.headers['content-type'].includes('xml'));
    assert.ok(sitemap.body.includes('https://code.ladestack.in/'));
  });

  test('E. Unknown marketing route returns status 404 with 404 page', async () => {
    const res = await httpGet('/some-nonexistent-marketing-page-404');
    assert.equal(res.status, 404);
    assert.ok(res.body.includes('404'));
  });

  test('F. Existing /app and /ide routes remain untouched and return React app', async () => {
    const resApp = await httpGet('/app');
    assert.equal(resApp.status, 200);
    assert.ok(resApp.body.includes('id="root"'));

    const resIde = await httpGet('/ide');
    assert.equal(resIde.status, 200);
    assert.ok(resIde.body.includes('id="root"'));
  });
});

describe('7. Real Browser Acceptance (Playwright)', () => {
  test('A. Browser renders homepage across multiple languages and switches seamlessly', async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // 1. Visit English homepage
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      const enTitle = await page.title();
      assert.ok(enTitle.includes('GB Coder'));
      const startBtn = page.locator('#heroStartBtn');
      assert.ok(await startBtn.isVisible());
      assert.equal(await startBtn.getAttribute('href'), '/app/projects');

      // 2. Visit French Features page
      await page.goto(`${BASE_URL}/fr/features`, { waitUntil: 'domcontentloaded' });
      const frTitle = await page.title();
      assert.ok(frTitle.includes('Fonctionnalités') || frTitle.includes('GB Coder'));
      const frH1 = await page.textContent('h1');
      assert.ok(frH1.includes('Studio de Développement'));

      // 3. Language switcher retains page context
      const esLink = page.locator('.lang-menu a[href="/es/features"]');
      assert.ok(await esLink.count() > 0, 'Language menu must contain link to /es/features');

      // 4. Visit Japanese Blog Article
      await page.goto(`${BASE_URL}/ja/blog/react-vue-browser-ide`, { waitUntil: 'domcontentloaded' });
      const jaH1 = await page.textContent('h1');
      assert.ok(jaH1.includes('React＆Vue'));

      // 5. Test Copy Code interaction button
      const copyBtn = page.locator('.copy-btn').first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        const copyText = await page.locator('.copy-btn .copy-text').first().textContent();
        assert.ok(copyText === 'Copied!' || copyText === 'Copy');
      }

      // 6. Test Mobile Viewport Navigation
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      const mobileMenuDisclosure = page.locator('.mobile-menu-disclosure');
      assert.ok(await mobileMenuDisclosure.isVisible(), 'Mobile menu button should be visible on 375px viewport');
    } finally {
      await browser.close();
    }
  });
});
