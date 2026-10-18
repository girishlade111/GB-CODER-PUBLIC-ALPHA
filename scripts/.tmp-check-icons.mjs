import fs from 'fs';

const filesToCheck = [
  'src/components/vscode/VSCodeMode.tsx',
  'src/components/vscode/WorkspaceSearchPanel.tsx',
  'src/components/vscode/ProblemsPanel.tsx',
  'src/components/vscode/OutputPanel.tsx',
  'src/components/CommandPalette.tsx',
];

for (const f of filesToCheck) {
  const code = fs.readFileSync(f, 'utf8');
  const importMatches = [...code.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g)];
  const imported = new Set();
  for (const m of importMatches) {
    for (const item of m[1].split(',')) {
      const trimmed = item.trim();
      if (trimmed) imported.add(trimmed);
    }
  }

  // Find all JSX tags
  const jsxTags = new Set([...code.matchAll(/<([A-Z][a-zA-Z0-9]+)/g)].map((m) => m[1]));
  for (const tag of jsxTags) {
    // If it's a known Lucide icon name but not imported and not a locally defined component
    if (
      [
        'AlertTriangle',
        'AlertCircle',
        'Info',
        'FileCode',
        'TerminalSquare',
        'Settings',
        'Sliders',
        'Sparkles',
        'Bug',
        'Terminal',
        'Plus',
        'Check',
        'Copy',
      ].includes(tag)
    ) {
      if (!imported.has(tag)) {
        console.log(`MISSING IMPORT in ${f}: ${tag}`);
      }
    }
  }
}
console.log('Check complete.');
