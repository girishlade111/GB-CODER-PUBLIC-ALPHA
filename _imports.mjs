import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
const mod = await import("./src/services/templates/nextjs/blog.ts");
const t = mod.default;
const root = join(process.cwd(), "_chk");
rmSync(root, { recursive: true, force: true });
for (const f of t.files) { const d = join(root, f.path); mkdirSync(join(d,".."), {recursive:true}); writeFileSync(d, f.content); }
for (const f of t.files) {
  if (!/\.(jsx|js|ts|tsx|vue)$/.test(f.path)) continue;
  for (const m of f.content.matchAll(/(?:from|import)\s*['"](\.[^'"]+)['"]/g)) {
    const spec = m[1];
    const base = join(root, join(f.path, ".."), spec);
    const cands = [base, base+".jsx", base+".js", base+".vue", base+"/index.jsx"];
    if (!cands.some(existsSync)) console.log("MISSING  " + f.path + "  ->  " + spec);
  }
}
rmSync(root, { recursive: true, force: true });
console.log("done");
