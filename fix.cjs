const fs = require('fs');
const p = 'src/components/TemplateSelectorModal.tsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(p, c);
