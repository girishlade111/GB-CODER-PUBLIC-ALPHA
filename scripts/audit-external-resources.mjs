import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const urls = new Set();
function walk(dir) {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') walk(full);
    } else if (/\.(tsx?|jsx?|html|css|json)$/.test(f)) {
      const content = readFileSync(full, 'utf8');
      const matches = content.matchAll(/https?:\/\/[^\s'"\`><)\\]+/g);
      for (const m of matches) {
        const u = m[0].replace(/[,.;]+$/, '');
        urls.add({ url: u, file: full });
      }
    }
  }
}

walk('src');
walk('public');
const indexContent = readFileSync('index.html', 'utf8');
for (const m of indexContent.matchAll(/https?:\/\/[^\s'"\`><)\\]+/g)) {
  urls.add({ url: m[0].replace(/[,.;]+$/, ''), file: 'index.html' });
}

console.log('Total external URL occurrences:', urls.size);
const domainMap = new Map();
for (const item of urls) {
  try {
    const hostname = new URL(item.url).hostname;
    if (!domainMap.has(hostname)) domainMap.set(hostname, []);
    domainMap.get(hostname).push(item);
  } catch (e) {}
}

for (const [domain, items] of domainMap.entries()) {
  console.log(`\nDomain: ${domain} (${items.length} references)`);
  items.slice(0, 3).forEach(it => console.log(`  - ${it.url} (in ${it.file})`));
}
