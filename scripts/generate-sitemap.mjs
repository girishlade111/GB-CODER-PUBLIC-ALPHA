#!/usr/bin/env node
/** GB Coder's 84 canonical public URLs, shared with Astro's XML endpoint. */
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { generateSitemapXml } from "../apps/marketing/src/data/sitemap.mjs";
export { generateSitemapXml };

const xml = generateSitemapXml();
writeFileSync(join(process.cwd(), "public", "sitemap.xml"), xml, "utf8");
console.log(
  `Generated public/sitemap.xml (${(xml.match(/<loc>/g) || []).length} URLs)`,
);
if (existsSync(join(process.cwd(), "dist"))) {
  writeFileSync(join(process.cwd(), "dist", "sitemap.xml"), xml, "utf8");
}
