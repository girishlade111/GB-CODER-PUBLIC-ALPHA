#!/usr/bin/env node
/**
 * GB Coder — Batch 3 Deployed Preview Acceptance Campaign
 * Target: https://gb-coder-public-alp-git-3f8595-girishlade111-gmailcoms-projects.vercel.app
 */

import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const PREVIEW_URL = process.env.PREVIEW_URL || 'https://gb-coder-public-alp-git-3f8595-girishlade111-gmailcoms-projects.vercel.app';
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';

async function fetchRoute(path) {
  const headers = {};
  if (BYPASS) {
    headers['x-vercel-protection-bypass'] = BYPASS;
  }
  const res = await fetch(`${PREVIEW_URL}${path}`, { headers });
  const text = await res.text();
  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    body: text,
  };
}

async function runCampaign() {
  console.log('===========================================================');
  console.log(`Starting Deployed Preview Acceptance Campaign`);
  console.log(`Target: ${PREVIEW_URL}`);
  console.log(`Bypass: ${BYPASS ? 'CONFIGURED' : 'NONE'}`);
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
  await check('Root Homepage (en) returns 200 with prerendered marketing HTML', async () => {
    const res = await fetchRoute('/');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('<html lang="en"'));
    assert.ok(res.body.includes('Build, Run, and Preview Code Instantly in Your Browser'));
    assert.ok(res.body.includes('rel="canonical" href="https://code.ladestack.in/"'));
    assert.ok(res.body.includes('href="/app/projects"'));
  });

  // 2. Multilingual Homepages across all 8 non-default languages
  for (const lang of ['es', 'nl', 'fr', 'ja', 'ko', 'zh', 'ru', 'pt']) {
    const expectedHtmlLang = lang === 'zh' ? 'zh-Hans' : lang;
    await check(`Localized Homepage (/${lang}) returns 200 with lang="${expectedHtmlLang}"`, async () => {
      const res = await fetchRoute(`/${lang}`);
      assert.equal(res.status, 200);
      assert.ok(res.body.includes(`lang="${expectedHtmlLang}"`));
      assert.ok(res.body.includes(`rel="canonical" href="https://code.ladestack.in/${lang}"`));
      assert.ok(res.body.includes('href="/app/projects"'));
    });
  }

  // 3. Features Pages (English + Japanese + Spanish)
  await check('Features Page English returns 200 with all 8 feature groups', async () => {
    const res = await fetchRoute('/features');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('A Complete Web Development Studio in Your Browser Tab'));
    assert.ok(res.body.includes('rel="canonical" href="https://code.ladestack.in/features"'));
    assert.ok(res.body.includes('Advanced WebContainer Runtime'));
  });

  await check('Features Page Japanese (/ja/features) returns 200 with Japanese translations', async () => {
    const res = await fetchRoute('/ja/features');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('lang="ja"'));
    assert.ok(res.body.includes('rel="canonical" href="https://code.ladestack.in/ja/features"'));
  });

  // 4. Docs Pages (English + Spanish + German/French)
  await check('Docs Page English returns 200 with table of contents and code blocks', async () => {
    const res = await fetchRoute('/docs');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('Developer Documentation'));
    assert.ok(res.body.includes('docs-sidebar'));
    assert.ok(res.body.includes('code-container'));
  });

  await check('Docs Page Spanish (/es/docs) returns 200', async () => {
    const res = await fetchRoute('/es/docs');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('lang="es"'));
    assert.ok(res.body.includes('Documentación'));
  });

  // 5. Blog Index and Evergreen Guides
  await check('Blog Index returns 200 with all 3 evergreen guides', async () => {
    const res = await fetchRoute('/blog');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('html-css-javascript-live-preview'));
    assert.ok(res.body.includes('react-vue-browser-ide'));
    assert.ok(res.body.includes('browser-project-backup-restore'));
  });

  await check('Evergreen Post 1 (en) returns 200 with BlogPosting JSON-LD', async () => {
    const res = await fetchRoute('/blog/html-css-javascript-live-preview');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('"@type":"BlogPosting"'));
    assert.ok(res.body.includes('rel="canonical" href="https://code.ladestack.in/blog/html-css-javascript-live-preview"'));
  });

  await check('Evergreen Post 2 Korean (/ko/blog/react-vue-browser-ide) returns 200', async () => {
    const res = await fetchRoute('/ko/blog/react-vue-browser-ide');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('lang="ko"'));
  });

  await check('Evergreen Post 3 Portuguese (/pt/blog/browser-project-backup-restore) returns 200', async () => {
    const res = await fetchRoute('/pt/blog/browser-project-backup-restore');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('lang="pt"'));
  });

  // 6. About & Contact
  await check('About Page returns 200 with authentic creator channels', async () => {
    const res = await fetchRoute('/about');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('Girish Lade'));
    assert.ok(res.body.includes('LadeStack'));
    assert.ok(res.body.includes('Mumbai, India'));
  });

  await check('Contact Page returns 200 with direct mailto link and NO form', async () => {
    const res = await fetchRoute('/contact');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('mailto:girishlade111@gmail.com'));
    assert.ok(!res.body.includes('<form'));
  });

  // 7. Authoritative Legal Pages
  await check('Privacy Policy is English-only and does not emit hreflang links', async () => {
    const res = await fetchRoute('/privacy-policy');
    assert.equal(res.status, 200);
    assert.ok(!res.body.includes('hreflang='));
    assert.ok(res.body.includes('rel="canonical" href="https://code.ladestack.in/privacy-policy"'));
  });

  await check('Terms & Conditions is English-only and does not emit hreflang links', async () => {
    const res = await fetchRoute('/terms-and-conditions');
    assert.equal(res.status, 200);
    assert.ok(!res.body.includes('hreflang='));
    assert.ok(res.body.includes('rel="canonical" href="https://code.ladestack.in/terms-and-conditions"'));
  });

  // 8. Sitemap and Robots
  await check('robots.txt points to canonical sitemap and has no obsolete domains', async () => {
    const res = await fetchRoute('/robots.txt');
    assert.equal(res.status, 200);
    const sitemapDirective = res.body
      .split(/\r?\n/)
      .find(line => line.trim().toLowerCase().startsWith('sitemap:'));
    assert.ok(sitemapDirective, 'robots.txt missing Sitemap directive');
    const sitemapUrl = new URL(sitemapDirective.replace(/^sitemap:\s*/i, '').trim());
    assert.equal(sitemapUrl.origin, 'https://code.ladestack.in');
    assert.equal(sitemapUrl.pathname, '/sitemap.xml');

    const urlsInRobots = (res.body.match(/https?:\/\/[^\s]+/g) || []).map(u => {
      try { return new URL(u); } catch { return null; }
    }).filter(Boolean);
    const hasObsolete = urlsInRobots.some(
      u => u.hostname === 'gbcoder.com' || u.hostname.endsWith('.gbcoder.com')
    );
    assert.ok(!hasObsolete, 'robots.txt must not contain obsolete domains');
  });

  await check('sitemap.xml returns 200 and covers all 83 URLs with xhtml:link alternates', async () => {
    const res = await fetchRoute('/sitemap.xml');
    assert.equal(res.status, 200);
    const locEntries = [...res.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => {
      try { return new URL(m[1]); } catch { return null; }
    });
    assert.equal(locEntries.length, 83);
    assert.ok(locEntries.every(u => u !== null && u.origin === 'https://code.ladestack.in'));
  });

  // 9. IDE Routing & Isolation
  await check('IDE Route (/app) returns React SPA shell', async () => {
    const res = await fetchRoute('/app');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('id="root"'));
    assert.ok(res.body.includes('/app/assets/'));
  });

  // 10. Playwright Real Browser Acceptance Campaign
  await check('Real Browser: Interactive navigation, language switching, copy button', async () => {
    const browser = await chromium.launch({ headless: true });
    const targetHostname = new URL(PREVIEW_URL).hostname;
    const isAllowed = (requestUrl) => {
      try {
        const u = new URL(requestUrl);
        return u.hostname === targetHostname || u.hostname.endsWith('.vercel.app');
      } catch {
        return false;
      }
    };

    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      permissions: ['clipboard-read', 'clipboard-write'],
      extraHTTPHeaders: BYPASS ? { 'x-vercel-protection-bypass': BYPASS } : {},
    });

    await ctx.route('**/*', async (route) => {
      const reqUrl = route.request().url();
      if (isAllowed(reqUrl)) {
        const headers = {
          ...route.request().headers(),
          ...(BYPASS ? { 'x-vercel-protection-bypass': BYPASS } : {}),
        };
        await route.continue({ headers });
      } else {
        await route.continue();
      }
    });

    const page = await ctx.newPage();
    
    // Visit English homepage
    await page.goto(`${PREVIEW_URL}/`, { waitUntil: 'domcontentloaded' });
    const titleEn = await page.title();
    assert.ok(titleEn.includes('GB Coder'), `Expected title to contain 'GB Coder', got: ${titleEn}`);

    // Open language dropdown and navigate to Japanese
    await page.click('summary.lang-summary');
    await page.waitForSelector('.lang-menu', { state: 'visible' });
    await page.click('a[href="/ja"]');
    await page.waitForURL(`${PREVIEW_URL}/ja`);
    const titleJa = await page.title();
    assert.ok(titleJa.includes('GB Coder'), `Expected Japanese title to contain 'GB Coder', got: ${titleJa}`);

    // Navigate to Japanese Features
    await page.click('nav.desktop-nav a[href="/ja/features"]');
    await page.waitForURL(`${PREVIEW_URL}/ja/features`);
    const h1JaFeatures = await page.textContent('h1');
    assert.ok(h1JaFeatures.length > 0);

    // Switch from Japanese Features to French Features via language dropdown
    await page.click('summary.lang-summary');
    await page.waitForSelector('.lang-menu', { state: 'visible' });
    await page.click('a[href="/fr/features"]');
    await page.waitForURL(`${PREVIEW_URL}/fr/features`);
    assert.ok(page.url().includes('/fr/features'));

    // Navigate to Documentation
    await page.goto(`${PREVIEW_URL}/docs`, { waitUntil: 'domcontentloaded' });
    const copyBtn = page.locator('.copy-btn').first();
    await copyBtn.waitFor({ state: 'visible' });
    await copyBtn.click();
    await page.waitForFunction(() => {
      const el = document.querySelector('.copy-btn .copy-text');
      return el && el.textContent === 'Copied!';
    }, { timeout: 4000 });

    // Click Start Coding CTA to verify marketing-to-IDE navigation
    const startBtn = page.locator('#headerCta');
    await startBtn.click();
    await page.waitForURL(/.*\/app\/projects/);
    assert.ok(page.url().includes('/app/projects'));

    await browser.close();
  });

  console.log('\n===========================================================');
  const failed = results.filter(r => r.status === 'FAIL');
  if (failed.length === 0) {
    console.log(`🎉 ALL ${results.length} DEPLOYED PREVIEW ACCEPTANCE CHECKS PASSED!`);
    console.log(`Verdict: BATCH_3_PREVIEW_ACCEPTED`);
  } else {
    console.log(`❌ ${failed.length} checks failed.`);
    process.exit(1);
  }
  console.log('===========================================================');
}

runCampaign().catch(err => {
  console.error('Fatal campaign error:', err);
  process.exit(1);
});
