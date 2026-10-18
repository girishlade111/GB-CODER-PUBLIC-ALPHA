import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { chromium as original } from 'playwright';

export const base = 'https://gb-coder-public-alpha-6l37qqpda.vercel.app';
export const deploymentId = 'dpl_AJLZJp924BvwnZAf1KyZmnQYgttS';
export const approvedSha = '30804ea3e3f94814b46b7a9934fb477f91354615';
const team = 'team_0KwVxrmoybIMrA9NiwTV5FLY';
const projectId = 'prj_Cbyer1VtBwQwrqRVCFhNOUERJFiD';
const cli = 'C:/Users/Girish Lade/AppData/Local/npm-cache/_npx/69f9afb961c37556/node_modules/vercel/dist/index.js';
export function api(path) {
  try {
    return JSON.parse(execFileSync(process.execPath, [cli, '--scope',
      'girishlade111-gmailcoms-projects', 'api', path + (path.includes('?') ? '&' : '?') +
      'teamId=' + team, '--method', 'GET'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  } catch (error) { throw Error('Read-only Vercel API failed; CLI exit ' + error.status); }
}
const project = api('/v9/projects/' + projectId);
if (project.id !== projectId || project.link?.productionBranch !== 'main') throw Error('Project/Production branch mismatch');
const secrets = Object.keys(project.protectionBypass || {}).filter(key => project.protectionBypass[key].scope === 'automation-bypass');
if (secrets.length !== 1) throw Error('Expected the one existing authorized automation credential; no credential mutation permitted');
const secret = secrets[0];
export const safe = value => {
  let text = JSON.stringify(value);
  for (const credential of secrets) text = text.split(credential).join('[REDACTED]');
  return JSON.parse(text);
};
export const writeEvidence = (path, value) => fs.writeFile(path, JSON.stringify(safe(value), null, 2));
export function getDeployment() {
  const p = api('/v13/deployments/' + deploymentId + '?withGitRepoInfo=true');
  if (p.id !== deploymentId || p.projectId !== projectId || 'https://' + p.url !== base ||
    p.gitSource?.sha !== approvedSha || p.meta?.githubCommitSha !== approvedSha ||
    p.gitSource?.ref !== 'phase-2.2-webcontainer-reliability' || p.target === 'production' || p.customEnvironment?.id)
    throw Error('Deployment identity/Preview target mismatch');
  return { checkedAt: new Date().toISOString(), id: p.id, url: p.url, projectId: p.projectId,
    readyState: p.readyState, status: p.status, target: p.target, environment: p.target === null ? 'preview' : p.target,
    gitSource: p.gitSource, meta: { sha: p.meta?.githubCommitSha, branch: p.meta?.githubCommitRef,
      repo: p.meta?.githubRepo, org: p.meta?.githubOrg }, createdAt: p.createdAt,
    buildingAt: p.buildingAt, ready: p.ready, errorCode: p.errorCode, errorMessage: p.errorMessage };
}
export async function get(context, path) {
  if (!path.startsWith('/') || path.startsWith('//')) throw Error('Exact Preview origin only');
  return (context.request || context).get(base + path, { headers: { 'x-vercel-protection-bypass': secret }, maxRedirects: 0 });
}
export const chromium = { async launch(options) {
  const d = getDeployment();
  if (d.readyState !== 'READY' || d.environment !== 'preview') throw Error('Exact Preview is not READY');
  const browser = await original.launch(options), newContext = browser.newContext.bind(browser);
  browser.newContext = async options => {
    const context = await newContext(options);
    await context.route(base + '/**', async route => {
      if (new URL(route.request().url()).origin !== base) throw Error('Credential origin guard');
      await route.continue({ headers: { ...route.request().headers(), 'x-vercel-protection-bypass': secret } });
    });
    const bootstrap = await context.request.get(base + '/app/projects', { headers: {
      'x-vercel-protection-bypass': secret, 'x-vercel-set-bypass-cookie': 'true' }, maxRedirects: 0 });
    if (bootstrap.status() === 307 && new URL(bootstrap.headers().location, base).origin !== base)
      throw Error('Refused external authentication redirect');
    const access = await get(context, '/app/projects');
    if (access.status() !== 200 || !(await access.text()).includes('id="root"')) {
      await context.close(); throw Error('Existing credential did not grant application access');
    }
    return context;
  };
  return browser;
} };
