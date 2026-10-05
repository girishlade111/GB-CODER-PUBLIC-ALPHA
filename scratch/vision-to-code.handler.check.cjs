const handler = require('../api/vision-to-code.js');

/** Minimal Express-shaped response recorder. */
const makeRes = () => ({
  statusCode: 200,
  headers: {},
  body: undefined,
  setHeader(k, v) {
    this.headers[k] = v;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
  end() {
    return this;
  },
});

const call = async (method, body, headers = {}) => {
  const res = makeRes();
  await handler({ method, body, headers, socket: {} }, res);
  return { status: res.statusCode, body: res.body };
};

const main = async () => {
  const validImage = 'aGVsbG8=';
  let failures = 0;

  const cases = [
    ['GET rejected', 'GET', {}],
    ['missing image', 'POST', { mimeType: 'image/png', framework: 'html-tailwind' }],
    ['bad mime', 'POST', { imageBase64: validImage, mimeType: 'image/gif', framework: 'html-tailwind' }],
    ['bad framework', 'POST', { imageBase64: validImage, mimeType: 'image/png', framework: 'svelte' }],
    ['oversized image', 'POST', { imageBase64: 'A'.repeat(8 * 1024 * 1024), mimeType: 'image/png', framework: 'html-tailwind' }],
  ];

  for (const [label, method, body] of cases) {
    const { status, body: payload } = await call(method, body);
    const ok = status >= 400 && payload && typeof payload.error === 'string';
    if (!ok) failures += 1;
    console.log(ok ? 'PASS' : 'FAIL', label, '->', status, JSON.stringify(payload));
  }

  // A valid request with no key anywhere must report configuration, not crash.
  delete process.env.GEMINI_API_KEY;
  const unconfigured = await call('POST', {
    imageBase64: validImage,
    mimeType: 'image/png',
    framework: 'html-tailwind',
  });
  const cfgOk = unconfigured.status === 500 && /GEMINI_API_KEY/.test(unconfigured.body.error);
  if (!cfgOk) failures += 1;
  console.log(cfgOk ? 'PASS' : 'FAIL', 'unconfigured ->', unconfigured.status, JSON.stringify(unconfigured.body));

  // A body-supplied key must be preferred over the environment.
  process.env.GEMINI_API_KEY = 'server-key-should-lose';
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  let usedKey = null;
  const original = GoogleGenerativeAI.prototype.getGenerativeModel;
  GoogleGenerativeAI.prototype.getGenerativeModel = function patched() {
    usedKey = this.apiKey;
    return {
      generateContent: async () => ({ response: { text: () => '```html\n<div>ok</div>\n```' } }),
    };
  };

  const okRes = await call('POST', {
    imageBase64: validImage,
    mimeType: 'image/png',
    framework: 'html-tailwind',
    apiKey: 'body-key-should-win',
  });
  GoogleGenerativeAI.prototype.getGenerativeModel = original;

  const keyOk =
    usedKey === 'body-key-should-win' && okRes.body && okRes.body.code === '<div>ok</div>';
  if (!keyOk) failures += 1;
  console.log(keyOk ? 'PASS' : 'FAIL', 'body key wins ->', JSON.stringify(usedKey), JSON.stringify(okRes.body));

  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
};

main();