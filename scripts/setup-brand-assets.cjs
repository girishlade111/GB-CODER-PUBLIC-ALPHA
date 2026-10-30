const fs = require('fs');
const path = require('path');

const faviconDir = 'favicon';
const publicDir = 'public';
const marketingPublicDir = path.join('apps', 'marketing', 'public');
const srcAssetsDir = path.join('src', 'assets');

if (!fs.existsSync(srcAssetsDir)) {
  fs.mkdirSync(srcAssetsDir, { recursive: true });
}

// 1. Copy all favicon files to public/ and apps/marketing/public/
const faviconFiles = fs.readdirSync(faviconDir);
for (const file of faviconFiles) {
  const src = path.join(faviconDir, file);
  fs.copyFileSync(src, path.join(publicDir, file));
  fs.copyFileSync(src, path.join(marketingPublicDir, file));
  console.log('Copied favicon file:', file);
}

// 2. Copy gbcoder-logo.png to public/, apps/marketing/public/, and src/assets/
fs.copyFileSync('gbcoder-logo.png', path.join(publicDir, 'gbcoder-logo.png'));
fs.copyFileSync('gbcoder-logo.png', path.join(marketingPublicDir, 'gbcoder-logo.png'));
fs.copyFileSync('gbcoder-logo.png', path.join(srcAssetsDir, 'gbcoder-logo.png'));
console.log('Copied gbcoder-logo.png to targets');

// 3. Create favicon.svg with embedded crisp 192x192 PNG for browsers that request svg favicons
const base64_192 = fs.readFileSync(path.join(faviconDir, 'android-chrome-192x192.png')).toString('base64');
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <image href="data:image/png;base64,${base64_192}" width="192" height="192"/>
</svg>\n`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
fs.writeFileSync(path.join(marketingPublicDir, 'favicon.svg'), svgContent, 'utf8');
console.log('Generated favicon.svg');

console.log('Asset placement complete!');
