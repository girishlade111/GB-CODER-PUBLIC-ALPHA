const h = require('../api/vision-to-code.js');

const fence = '```';
const tests = [
  [fence + 'html\n<div>hi</div>\n' + fence, '<div>hi</div>'],
  [fence + 'jsx\nconst A = () => <div/>;\n' + fence, 'const A = () => <div/>;'],
  ['plain code no fence', 'plain code no fence'],
  ['', ''],
  ['Here you go:\n' + fence + 'html\n<p>x</p>\n' + fence + '\nHope that helps!', '<p>x</p>'],
];

let failures = 0;
for (const [input, expected] of tests) {
  const got = h.extractCode(input);
  const pass = got === expected;
  if (!pass) failures += 1;
  console.log(pass ? 'PASS' : 'FAIL', JSON.stringify(input.slice(0, 24)), '->', JSON.stringify(got));
}

console.log('--- user message, no extra prompt ---');
console.log(h.buildUserMessage('html-tailwind', ''));
console.log('--- user message, with extra prompt ---');
console.log(h.buildUserMessage('html-tailwind', 'add dark mode'));
console.log('--- framework prompts ---', Object.keys(h.FRAMEWORK_PROMPTS));

console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);