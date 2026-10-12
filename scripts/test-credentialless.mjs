import { chromium } from 'playwright';

async function testCredentialless() {
  console.log('[TEST] Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
  });
  const page = await browser.newPage();

  // Test on localhost:4175 which has COEP: require-corp
  await page.goto('http://localhost:4175/', { waitUntil: 'domcontentloaded' });

  const testResults = await page.evaluate(async () => {
    return new Promise((resolve) => {
      // Create iframe with credentialless
      const iframe = document.createElement('iframe');
      iframe.setAttribute('credentialless', 'true');
      iframe.sandbox = 'allow-scripts';
      iframe.srcdoc = `
        <!DOCTYPE html>
        <html>
        <body>
          <img id="img" src="https://picsum.photos/200/200" />
          <script>
            const img = document.getElementById('img');
            img.onload = () => parent.postMessage({ type: 'IMG_RESULT', status: 'SUCCESS' }, '*');
            img.onerror = (e) => parent.postMessage({ type: 'IMG_RESULT', status: 'ERROR' }, '*');
          </script>
        </body>
        </html>
      `;

      const timer = setTimeout(() => {
        resolve({ timeout: true, status: 'TIMEOUT' });
      }, 7000);

      window.addEventListener('message', (event) => {
        if (event.data?.type === 'IMG_RESULT') {
          clearTimeout(timer);
          resolve(event.data);
        }
      });

      document.body.appendChild(iframe);
    });
  });

  console.log('[TEST] Credentialless iframe image load result:', testResults);

  await browser.close();
}

testCredentialless().catch(console.error);
