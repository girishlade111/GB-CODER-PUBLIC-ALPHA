const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 400 } });
  await page.setContent(`
    <aside style="width: 48px; height: 300px; overflow-y: auto; overflow-x: hidden; background: #222;">
      <div id="parent" style="width: 36px; height: 36px; margin: 6px; background: blue;">
        <span id="fixed-tip" style="position: fixed; left: 56px; top: 10px; z-index: 9999; background: red; color: white; padding: 4px 8px;">
          Fixed Tooltip
        </span>
      </div>
    </aside>
  `);
  const isRed = await page.evaluate(() => {
    const el = document.elementFromPoint(70, 20);
    return el ? el.id : null;
  });
  console.log('Element at point (70, 20):', isRed);
  await browser.close();
})();
