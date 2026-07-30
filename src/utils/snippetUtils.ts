import { CodeSnippet, SnippetType } from '../types';

export const exportSnippetAsJSON = (snippet: CodeSnippet): void => {
  const dataStr = JSON.stringify(snippet, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${snippet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export const importSnippetFromJSON = (file: File): Promise<CodeSnippet> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const snippet = JSON.parse(content) as CodeSnippet;

        // Validate snippet structure
        if (!snippet.name || !snippet.html || !snippet.css || !snippet.javascript) {
          throw new Error('Invalid snippet format');
        }

        // Generate new ID and timestamp for imported snippet
        const importedSnippet: CodeSnippet = {
          ...snippet,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        resolve(importedSnippet);
      } catch {
        reject(new Error('Failed to parse snippet file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

export const exportAllSnippets = (snippets: CodeSnippet[]): void => {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    snippets: snippets,
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `polyglot-snippets-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export const searchSnippets = (snippets: CodeSnippet[], query: string): CodeSnippet[] => {
  if (!query.trim()) return snippets;

  const searchTerm = query.toLowerCase();

  return snippets.filter(snippet =>
    snippet.name.toLowerCase().includes(searchTerm) ||
    snippet.description?.toLowerCase().includes(searchTerm) ||
    snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    snippet.category?.toLowerCase().includes(searchTerm) ||
    snippet.html.toLowerCase().includes(searchTerm) ||
    snippet.css.toLowerCase().includes(searchTerm) ||
    snippet.javascript.toLowerCase().includes(searchTerm)
  );
};

export const sortSnippets = (snippets: CodeSnippet[], sortBy: 'name' | 'date' | 'updated'): CodeSnippet[] => {
  return [...snippets].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updated': {
        const aUpdated = a.updatedAt || a.createdAt;
        const bUpdated = b.updatedAt || b.createdAt;
        return new Date(bUpdated).getTime() - new Date(aUpdated).getTime();
      }
      default:
        return 0;
    }
  });
};

export const getSnippetStats = (snippets: CodeSnippet[]) => {
  const totalSnippets = snippets.length;
  const totalSize = snippets.reduce((acc, snippet) =>
    acc + snippet.html.length + snippet.css.length + snippet.javascript.length, 0
  );

  const categories = [...new Set(snippets.map(s => s.category).filter(Boolean))];
  const tags = [...new Set(snippets.flatMap(s => s.tags || []))];

  return {
    totalSnippets,
    totalSize,
    averageSize: totalSnippets > 0 ? Math.round(totalSize / totalSnippets) : 0,
    categories: categories.length,
    tags: tags.length,
  };
};

// Type Detection
export const detectSnippetType = (snippet: Pick<CodeSnippet, 'html' | 'css' | 'javascript'>): SnippetType => {
  const hasHtml = snippet.html.trim().length > 0;
  const hasCss = snippet.css.trim().length > 0;
  const hasJs = snippet.javascript.trim().length > 0;

  // If all three have content, it's a full snippet
  if (hasHtml && hasCss && hasJs) return 'full';

  // Otherwise, classify by primary content
  if (hasHtml && !hasCss && !hasJs) return 'html';
  if (hasCss && !hasHtml && !hasJs) return 'css';
  if (hasJs && !hasHtml && !hasCss) return 'javascript';

  // If mixed but not all three, classify as full
  return 'full';
};

// Migration Functions
export const migrateSnippet = (snippet: CodeSnippet): CodeSnippet => {
  // If already has type and scope, no migration needed
  if (snippet.type && snippet.scope) {
    return snippet;
  }

  return {
    ...snippet,
    type: snippet.type || detectSnippetType(snippet),
    scope: snippet.scope || 'private',
  };
};

export const migrateSnippets = (snippets: CodeSnippet[]): CodeSnippet[] => {
  return snippets.map(migrateSnippet);
};

// Filter Functions
export const filterByType = (
  snippets: CodeSnippet[],
  type: SnippetType | 'all'
): CodeSnippet[] => {
  if (type === 'all') return snippets;
  return snippets.filter(s => (s.type || detectSnippetType(s)) === type);
};

// Recommended Snippets
export const getRecommendedSnippets = (): CodeSnippet[] => {
  return [
    {
      id: 'rec-1',
      name: 'Responsive Grid Layout',
      description: 'A modern CSS Grid layout that adapts to different screen sizes',
      html: '<div class="grid-container">\n  <div class="grid-item">Item 1</div>\n  <div class="grid-item">Item 2</div>\n  <div class="grid-item">Item 3</div>\n</div>',
      css: '.grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1rem;\n  padding: 1rem;\n}\n\n.grid-item {\n  background: #f0f0f0;\n  padding: 2rem;\n  border-radius: 8px;\n  text-align: center;\n}',
      javascript: '',
      createdAt: new Date().toISOString(),
      tags: ['layout', 'responsive', 'grid'],
      category: 'Layouts',
      type: 'full',
      scope: 'public',
    },
    {
      id: 'rec-2',
      name: 'Smooth Scroll Animation',
      description: 'Smooth scrolling behavior for anchor links',
      html: '',
      css: 'html {\n  scroll-behavior: smooth;\n}',
      javascript: '',
      createdAt: new Date().toISOString(),
      tags: ['animation', 'scroll', 'ux'],
      category: 'Animations',
      type: 'css',
      scope: 'public',
    },
    {
      id: 'rec-3',
      name: 'DOM Ready Function',
      description: 'Execute code when DOM is fully loaded',
      html: '',
      css: '',
      javascript: 'document.addEventListener("DOMContentLoaded", function() {\n  console.log("DOM is ready!");\n  // Your code here\n});',
      createdAt: new Date().toISOString(),
      tags: ['dom', 'utility', 'initialization'],
      category: 'JavaScript Utilities',
      type: 'javascript',
      scope: 'public',
    },
    {
      id: 'rec-4',
      name: 'Card Component',
      description: 'Reusable card component with hover effect',
      html: '<div class="card">\n  <div class="card-image">\n    <img src="https://via.placeholder.com/300x200" alt="Card image">\n  </div>\n  <div class="card-content">\n    <h3>Card Title</h3>\n    <p>Card description goes here</p>\n  </div>\n</div>',
      css: '.card {\n  border-radius: 12px;\n  overflow: hidden;\n  box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n  transition: transform 0.3s ease, box-shadow 0.3s ease;\n}\n\n.card:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 8px 12px rgba(0,0,0,0.15);\n}\n\n.card-content {\n  padding: 1.5rem;\n}\n\n.card-content h3 {\n  margin: 0 0 0.5rem 0;\n}\n\n.card-content p {\n  margin: 0;\n  color: #666;\n}',
      javascript: '',
      createdAt: new Date().toISOString(),
      tags: ['component', 'card', 'ui'],
      category: 'Components',
      type: 'full',
      scope: 'public',
    },
    {
      id: 'rec-5',
      name: 'Fetch API Helper',
      description: 'Simple async/await fetch wrapper with error handling',
      html: '',
      css: '',
      javascript: 'async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error(`HTTP error! status: ${response.status}`);\n    }\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Fetch error:", error);\n    return null;\n  }\n}\n\n// Usage:\n// const data = await fetchData("https://api.example.com/data");',
      createdAt: new Date().toISOString(),
      tags: ['api', 'fetch', 'async', 'utility'],
      category: 'JavaScript Utilities',
      type: 'javascript',
      scope: 'public',
    },
  ];
};