// Local HTTP model of Vercel's compiled configuration, not the Vercel edge runtime.
// Install @vercel/routing-utils outside the checkout and provide its package path:
// VERCEL_ROUTING_UTILS_PATH=<tools>/node_modules/@vercel/routing-utils
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createPreviewServer } from '../preview-combined.mjs';

const require = createRequire(import.meta.url);
export const routingUtils = require(process.env.VERCEL_ROUTING_UTILS_PATH || '@vercel/routing-utils');
export function compileRoutes(config) {
  const result = routingUtils.getTransformedRoutes(config);
  if (result.error) throw new Error(JSON.stringify(result.error));
  return result.routes;
}
const mime = { '.html':'text/html', '.js':'application/javascript', '.mjs':'application/javascript',
  '.css':'text/css', '.json':'application/json', '.webmanifest':'application/manifest+json',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpeg':'image/jpeg', '.jpg':'image/jpeg',
  '.ico':'image/x-icon', '.wasm':'application/wasm', '.map':'application/json', '.txt':'text/plain' };

export function createRoutingPreview(config = JSON.parse(readFileSync('vercel.json','utf8'))) {
  const routes = compileRoutes(config), root = resolve('dist');
  const api = createPreviewServer();
  function serve(pathname, res) {
    const file = resolve(root, '.' + pathname);
    if (!file.startsWith(root + sep) && file !== root) return false;
    const candidate = existsSync(file) && statSync(file).isDirectory() ? resolve(file,'index.html') : file;
    if (!existsSync(candidate) || !statSync(candidate).isFile()) return false;
    res.statusCode=200; res.setHeader('Content-Type',mime[extname(candidate)] || 'application/octet-stream');
    res.end(readFileSync(candidate)); return true;
  }
  return createServer((req,res)=>{
    const pathname = new URL(req.url,'http://localhost').pathname;
    for(const route of routes) {
      if(route.handle==='filesystem') {
        if(pathname.startsWith('/api/')) { api.emit('request',req,res);return; }
        if(serve(pathname,res))return;
        continue;
      }
      const match = new RegExp(route.src).exec(pathname);
      if(!match)continue;
      for(const [key,value] of Object.entries(route.headers || {}))res.setHeader(key,value);
      if(route.dest) {
        const destination=route.dest.replace(/\$(\d+)/g,(_,n)=>match[Number(n)] || '');
        if(serve(destination,res))return;
      }
    }
    // The real edge may render a custom 404 page. This model uses plain text;
    // only rewrite selection, artifact selection and non-success are modeled.
    res.statusCode=404;res.setHeader('Content-Type','text/plain');res.end('Not Found');
  });
}
if(process.argv[1] && pathToFileURL(resolve(process.argv[1])).href===import.meta.url) {
  const port=Number(process.argv.find(a=>a.startsWith('--port='))?.split('=')[1] || 42995);
  createRoutingPreview().listen(port,'127.0.0.1',()=>console.log(`Compiled Vercel routing model: http://127.0.0.1:${port}`));
}
