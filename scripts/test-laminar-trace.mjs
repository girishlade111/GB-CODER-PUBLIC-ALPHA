import { Laminar, observe } from '@lmnr-ai/lmnr';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.LMNR_PROJECT_API_KEY || '13pMPcBJ0QfFIdYve0ZQ2ShJlz8QPTxcaWmNp0J5EDemEYipiv3UDKl7Fc09QoHa';

console.log('Initializing Laminar with API key:', apiKey.substring(0, 8) + '...');

Laminar.initialize({
  projectApiKey: apiKey,
});

async function runSampleLLMTrace() {
  return await observe({ name: 'gb-coder-instrumentation-test' }, async () => {
    console.log('Executing observed trace task...');
    return {
      status: 'success',
      project: 'GB Coder',
      timestamp: new Date().toISOString(),
      instrumentedWith: 'Laminar SDK',
      traceType: 'verification-trace'
    };
  });
}

async function main() {
  const result = await runSampleLLMTrace();
  console.log('Trace executed successfully:', result);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  try {
    await Laminar.shutdown();
  } catch (_) {}
  process.exit(0);
}

main().catch((err) => {
  console.error('Trace error:', err);
  process.exit(1);
});
