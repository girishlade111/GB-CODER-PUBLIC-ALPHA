/** Keep API clients on JSON; browser document requests get the shared page. */
function wantsStatusHtml(req) {
  return /(?:^|[,;\s])text\/html(?:[,;\s]|$)/i.test(req.headers?.accept || '');
}

function sendStatusPage(res, input = 500) {
  let pages;
  try { pages = require('./status-pages.generated.cjs'); }
  catch { throw new Error('Status documents are missing. Run npm run build:marketing first.'); }
  const code = Number.isInteger(input) && input >= 400 && input < 600 ? input : 500;
  // Unknown error codes use the corresponding generic class document/status.
  const resolved = pages[code] ? code : code < 500 ? 400 : 500;
  res.statusCode = resolved;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (resolved === 429) res.setHeader('Retry-After', '30');
  res.end(pages[resolved]);
}

module.exports = { sendStatusPage, wantsStatusHtml };
