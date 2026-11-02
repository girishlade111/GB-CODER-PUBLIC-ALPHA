export function GET() {
  return new Response(
    "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /preview/\nDisallow: /mpreview/\nDisallow: /preview-popout\nDisallow: /node_modules/\nDisallow: /src/\n\nSitemap: https://code.ladestack.in/sitemap.xml\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
