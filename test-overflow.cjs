const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setContent(`
    <aside id="s_vis" style="position: sticky; width: 48px; height: 500px; overflow-y: auto; background: #18181b; padding: 6px;">
      <div style="position: relative; width: 36px; height: 36px;">
        <span style="position: absolute; left: 100%; top: 50%; margin-left: 8px; width: 120px; visibility: hidden;">Tooltip</span>
      </div>
    </aside>
  `);
  const sv = await page.$('#s_vis');
  const d_vis = await sv.evaluate(el => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    hasHScroll: el.scrollWidth > el.clientWidth
  }));
  console.log('visibility: hidden ->', d_vis);

  await page.setContent(`
    <aside id="s_none" style="position: sticky; width: 48px; height: 500px; overflow-y: auto; background: #18181b; padding: 6px;">
      <div style="position: relative; width: 36px; height: 36px;">
        <span style="position: absolute; left: 100%; top: 50%; margin-left: 8px; width: 120px; display: none;">Tooltip</span>
      </div>
    </aside>
  `);
  const sn = await page.$('#s_none');
  const d_none = await sn.evaluate(el => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    hasHScroll: el.scrollWidth > el.clientWidth
  }));
  console.log('display: none ->', d_none);

  await browser.close();
})();
