const fs = require('fs');

const tPath = './src/components/TemplateSelectorModal.tsx';
let tContent = fs.readFileSync(tPath, 'utf8');
tContent = tContent.replace(
  "'border-danger text-danger bg-danger'",
  "'border-danger/40 text-red-400 bg-danger/10'"
);
fs.writeFileSync(tPath, tContent, 'utf8');

const vPath = './src/components/VoiceCommandPanel.tsx';
let vContent = fs.readFileSync(vPath, 'utf8');
vContent = vContent.replace(
  "return 'bg-danger text-danger';",
  "return 'bg-danger/15 text-danger';"
);
fs.writeFileSync(vPath, vContent, 'utf8');

console.log('Fixed red badge stylings successfully.');
