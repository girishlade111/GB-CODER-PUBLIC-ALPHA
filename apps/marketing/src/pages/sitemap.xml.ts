import { generateSitemapXml } from "../data/sitemap.mjs";
export function GET() {
  return new Response(generateSitemapXml(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
