const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const base64 = fs.readFileSync('favicon/apple-touch-icon.png').toString('base64');
  await page.setContent('<body style="background: #fff;"><img id="img" src="data:image/png;base64,' + base64 + '"></body>');
  const cornerColor = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const img = document.getElementById('img');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const p = ctx.getImageData(0, 0, 1, 1).data;
    return Array.from(p);
  });
  console.log('Corner pixel [R, G, B, A]:', cornerColor);
  await browser.close();
})();
