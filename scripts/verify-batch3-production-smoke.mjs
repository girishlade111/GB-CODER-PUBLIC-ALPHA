#!/usr/bin/env node
/**
 * GB Coder — Batch 3 Controlled Production Smoke Verification
 * Target: https://code.ladestack.in/
 */

import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const PROD_URL = 'https://code.ladestack.in';

async function fetchRoute(path) {
  const res = await fetch(`${PROD_URL}${path}`);
  const text = await res.text();
  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    body: text,
  };
}

async function runProductionSmoke() {
  console.log('===========================================================');
  console.log('GB CODER — BATCH 3 PRODUCTION SMOKE VERIFICATION');
  console.log(`Target: ${PROD_URL}`);
  console.log('===========================================================\n');

  const results = [];

  async function check(name, fn) {
    process.stdout.write(`• ${name}... `);
    try {
      await fn();
      console.log('✅ PASS');
      results.push({ name, status: 'PASS' });
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      results.push({ name, status: 'FAIL', error: err.message });
    }
  }

  // 1. Root English Homepage
  await check('Production Root Homepage (en) returns 200 with new editorial content', async () => {
    const res = await fetchRoute('/');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('<html lang="en"'));
    assert.ok(res.body.includes('Build, Run, and Preview Code Instantly in Your Browser'));
    assert.ok(res.body.includes('rel="canonical" href="https://code.ladestack.in/"'));
    assert.ok(res.body.includes('href="/app/projects"'));
  });

  // 2. All 9 Locale Homepages Reachable
  const locales = [
    { lang: 'es', htmlLang: 'es' },
    { lang: 'nl', htmlLang: 'nl' },
    { lang: 'fr', htmlLang: 'fr' },
    { lang: 'ja', htmlLang: 'ja' },
    { lang: 'ko', htmlLang: 'ko' },
    { lang: 'zh', htmlLang: 'zh-Hans' },
    { lang: 'ru', htmlLang: 'ru' },
    { lang: 'pt', htmlLang: 'pt' },
  ];

  for (const { lang, htmlLang } of locales) {
    await check(`Production Localized Homepage (/${lang}) returns 200 with lang="${htmlLang}"`, async () => {
      const res = await fetchRoute(`/${lang}`);
      assert.equal(res.status, 200);
      assert.ok(res.body.includes(`lang="${htmlLang}"`));
      assert.ok(res.body.includes(`rel="canonical" href="https://code.ladestack.in/${lang}"`));
      assert.ok(res.body.includes('href="/app/projects"'));
    });
  }

  // 3. Features Routes
  await check('Production Features Page (en) returns 200 with all feature groups', async () => {
    const res = await fetchRoute('/features');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('A Complete Web Development Studio in Your Browser Tab'));
    assert.ok(res.body.includes('rel="canonical" href="https://code.ladestack.in/features"'));
    assert.ok(res.body.includes('Advanced WebContainer Runtime'));
  });

  await check('Production Features Page Japanese (/ja/features) returns 200', async () => {
    const res = await fetchRoute('/ja/features');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('lang="ja"'));
    assert.ok(res.body.includes('rel="canonical" href="https://code.ladestack.in/ja/features"'));
  });

  // 4. Docs Routes
  await check('Production Docs Page (en) returns 200 with code blocks and TOC', async () => {
    const res = await fetchRoute('/docs');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('Developer Documentation'));
    assert.ok(res.body.includes('docs-sidebar'));
    assert.ok(res.body.includes('code-container'));
  });

  await check('Production Docs Page Spanish (/es/docs) returns 200', async () => {
    const res = await fetchRoute('/es/docs');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('lang="es"'));
    assert.ok(res.body.includes('Documentación'));
  });

  // 5. Blog Routes
  await check('Production Blog Index returns 200 with all 3 evergreen guides', async () => {
    const res = await fetchRoute('/blog');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('html-css-javascript-live-preview'));
    assert.ok(res.body.includes('react-vue-browser-ide'));
    assert.ok(res.body.includes('browser-project-backup-restore'));
  });

  await check('Production Blog Guide 1 returns 200 with BlogPosting JSON-LD', async () => {
    const res = await fetchRoute('/blog/html-css-javascript-live-preview');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('"@type":"BlogPosting"'));
    assert.ok(res.body.includes('rel="canonical" href="https://code.ladestack.in/blog/html-css-javascript-live-preview"'));
  });

  // 6. About & Contact
  await check('Production About Page returns 200 with authentic creator channels', async () => {
    const res = await fetchRoute('/about');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('Girish Lade'));
    assert.ok(res.body.includes('Mumbai, India'));
  });

  await check('Production Contact Page returns 200 with direct mailto link and NO form', async () => {
    const res = await fetchRoute('/contact');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('mailto:girishlade111@gmail.com'));
    assert.ok(!res.body.includes('<form'));
  });

  // 7. Authoritative Legal Pages
  await check('Production Privacy Policy is English-only and does NOT emit hreflang', async () => {
    const res = await fetchRoute('/privacy-policy');
    assert.equal(res.status, 200);
    assert.ok(!res.body.includes('hreflang='));
    assert.ok(res.body.includes('rel="canonical" href="https://code.ladestack.in/privacy-policy"'));
  });

  await check('Production Terms & Conditions is English-only and does NOT emit hreflang', async () => {
    const res = await fetchRoute('/terms-and-conditions');
    assert.equal(res.status, 200);
    assert.ok(!res.body.includes('hreflang='));
    assert.ok(res.body.includes('rel="canonical" href="https://code.ladestack.in/terms-and-conditions"'));
  });

  // 8. Sitemap and Robots
  await check('Production robots.txt has canonical sitemap and no obsolete domains', async () => {
    const res = await fetchRoute('/robots.txt');
    assert.equal(res.status, 200);
    const sitemapDirective = res.body.split(/\r?\n/).find(l => l.trim().toLowerCase().startsWith('sitemap:'));
    assert.ok(sitemapDirective, 'robots.txt missing Sitemap directive');
    const sitemapUrl = new URL(sitemapDirective.replace(/^sitemap:\s*/i, '').trim());
    assert.equal(sitemapUrl.origin, 'https://code.ladestack.in');
    assert.equal(sitemapUrl.pathname, '/sitemap.xml');

    const urls = (res.body.match(/https?:\/\/[^\s]+/g) || []).map(u => {
      try { return new URL(u); } catch { return null; }
    }).filter(Boolean);
    assert.ok(urls.every(u => u.hostname !== 'gbcoder.com' && !u.hostname.endsWith('.gbcoder.com')));
  });

  await check('Production sitemap.xml returns 200 and covers all 83 canonical URLs', async () => {
    const res = await fetchRoute('/sitemap.xml');
    assert.equal(res.status, 200);
    const locEntries = [...res.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => {
      try { return new URL(m[1]); } catch { return null; }
    });
    assert.equal(locEntries.length, 83);
    assert.ok(locEntries.every(u => u !== null && u.origin === 'https://code.ladestack.in'));
  });

  // 9. IDE Routes & Security Headers
  await check('Production IDE SPA route (/app) returns React shell', async () => {
    const res = await fetchRoute('/app');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('id="root"'));
    assert.ok(res.body.includes('/app/assets/'));
  });

  await check('Production /ide route has COOP/COEP cross-origin isolation headers', async () => {
    const res = await fetchRoute('/ide');
    assert.equal(res.status, 200);
    assert.equal(res.headers['cross-origin-opener-policy'], 'same-origin');
    assert.equal(res.headers['cross-origin-embedder-policy'], 'require-corp');
  });

  // 10. Playwright Browser Smoke Test
  await check('Real Browser Smoke: Language switching & marketing-to-IDE navigation', async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('baseline-browser-mapping')) {
          consoleErrors.push(text);
        }
      }
    });

    // 1. Visit production homepage
    await page.goto(`${PROD_URL}/`, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    assert.ok(title.includes('GB Coder'));

    // 2. Open language switcher dropdown and navigate to Japanese
    await page.click('summary.lang-summary');
    await page.waitForSelector('.lang-menu', { state: 'visible' });
    await page.click('a[href="/ja"]');
    await page.waitForURL(`${PROD_URL}/ja`);
    const titleJa = await page.title();
    assert.ok(titleJa.includes('GB Coder'));

    // 3. Click Start Coding CTA
    const startBtn = page.locator('#headerCta');
    await startBtn.click();
    await page.waitForURL(/.*\/app\/projects/);
    assert.ok(page.url().includes('/app/projects'));

    // 4. Verify no critical console errors on navigation
    assert.equal(consoleErrors.length, 0, `Critical console errors encountered: ${consoleErrors.join(', ')}`);

    await browser.close();
  });

  console.log('\n===========================================================');
  const failed = results.filter(r => r.status === 'FAIL');
  if (failed.length === 0) {
    console.log(`🎉 ALL ${results.length} PRODUCTION SMOKE CHECKS PASSED!`);
    console.log('Verdict: BATCH_3_PRODUCTION_RELEASE_SUCCESS');
  } else {
    console.log(`❌ ${failed.length} checks failed.`);
    process.exit(1);
  }
  console.log('===========================================================');
}

runProductionSmoke().catch(err => {
  console.error('Fatal Production smoke error:', err);
  process.exit(1);
});
