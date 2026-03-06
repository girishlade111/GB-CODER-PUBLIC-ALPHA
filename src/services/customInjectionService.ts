// Custom CSS/JS Injection Service for Preview Customization
export interface CustomInjection {
  id: string;
  name: string;
  type: 'css' | 'js';
  code: string;
  enabled: boolean;
  description?: string;
}

export interface PresetInjection {
  id: string;
  name: string;
  description: string;
  type: 'css' | 'js';
  code: string;
  category: 'animation' | 'debug' | 'utility' | 'accessibility';
}

class CustomInjectionService {
  private static instance: CustomInjectionService;
  private readonly STORAGE_KEY = 'gb-coder-custom-injections';

  private presetInjections: PresetInjection[] = [
    // CSS Presets
    {
      id: 'css-reset',
      name: 'CSS Reset',
      description: 'Basic CSS reset for consistent styling',
      type: 'css',
      category: 'utility',
      code: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}`,
    },
    {
      id: 'smooth-scroll',
      name: 'Smooth Scrolling',
      description: 'Enable smooth scrolling for the page',
      type: 'css',
      category: 'utility',
      code: `html {
  scroll-behavior: smooth;
}`,
    },
    {
      id: 'selection-color',
      name: 'Custom Text Selection',
      description: 'Style the text selection highlight',
      type: 'css',
      category: 'utility',
      code: `::selection {
  background: #667eea;
  color: white;
}

::-moz-selection {
  background: #667eea;
  color: white;
}`,
    },
    {
      id: 'focus-outline',
      name: 'Enhanced Focus Outline',
      description: 'Better focus indicators for accessibility',
      type: 'css',
      category: 'accessibility',
      code: `:focus {
  outline: 3px solid #667eea;
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 3px solid #667eea;
  outline-offset: 2px;
}`,
    },
    {
      id: 'reduce-motion',
      name: 'Respect Reduced Motion',
      description: 'Disable animations for users who prefer reduced motion',
      type: 'css',
      category: 'accessibility',
      code: `@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`,
    },
    {
      id: 'debug-layout',
      name: 'Debug Layout Borders',
      description: 'Show borders on all elements for debugging',
      type: 'css',
      category: 'debug',
      code: `* {
  outline: 1px solid rgba(255, 0, 0, 0.3) !important;
}`,
    },
    {
      id: 'bounce-animation',
      name: 'Bounce Animation',
      description: 'Add a bounce keyframe animation',
      type: 'css',
      category: 'animation',
      code: `@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.bounce {
  animation: bounce 1s ease-in-out infinite;
}`,
    },
    {
      id: 'fade-in',
      name: 'Fade In Animation',
      description: 'Smooth fade-in animation',
      type: 'css',
      category: 'animation',
      code: `@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}`,
    },
    // JavaScript Presets
    {
      id: 'console-timer',
      name: 'Console Timer',
      description: 'Add performance timing to console',
      type: 'js',
      category: 'debug',
      code: `// Add performance timing
console.time('pageLoad');
window.addEventListener('load', () => {
  console.timeEnd('pageLoad');
  console.log('Page fully loaded!');
});`,
    },
    {
      id: 'error-handler',
      name: 'Global Error Handler',
      description: 'Catch and log global errors',
      type: 'js',
      category: 'debug',
      code: `window.addEventListener('error', (event) => {
  console.error('Global error caught:', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});`,
    },
    {
      id: 'click-ripple',
      name: 'Click Ripple Effect',
      description: 'Add ripple effect on click',
      type: 'js',
      category: 'animation',
      code: `document.addEventListener('click', (e) => {
  const ripple = document.createElement('span');
  ripple.className = 'click-ripple';
  ripple.style.cssText = \`
    position: fixed;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(102, 126, 234, 0.6);
    transform: scale(0);
    animation: rippleEffect 0.6s ease-out;
    pointer-events: none;
    left: \${e.clientX - 10}px;
    top: \${e.clientY - 10}px;
    z-index: 9999;
  \`;
  
  document.body.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
});

// Add the keyframe animation
if (!document.getElementById('ripple-styles')) {
  const style = document.createElement('style');
  style.id = 'ripple-styles';
  style.textContent = \`
    @keyframes rippleEffect {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  \`;
  document.head.appendChild(style);
}`,
    },
    {
      id: 'keyboard-shortcuts',
      name: 'Keyboard Shortcuts',
      description: 'Add useful keyboard shortcuts',
      type: 'js',
      category: 'utility',
      code: `document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to prevent default save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    console.log('Save shortcut pressed!');
  }
  
  // Escape to clear selection
  if (e.key === 'Escape') {
    window.getSelection()?.removeAllRanges();
    console.log('Selection cleared');
  }
  
  // F12 to toggle dev tools (won't work in most browsers, but here for completeness)
  if (e.key === 'F12') {
    console.log('Dev tools requested');
  }
});`,
    },
    {
      id: 'lazy-images',
      name: 'Lazy Load Images',
      description: 'Automatically lazy load all images',
      type: 'js',
      category: 'utility',
      code: `// Enable native lazy loading for all images
document.querySelectorAll('img:not([loading])').forEach(img => {
  img.setAttribute('loading', 'lazy');
});

// Add intersection observer for fade-in effect
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.classList.add('loaded');
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img').forEach(img => {
  imageObserver.observe(img);
});

// Add fade-in styles
const style = document.createElement('style');
style.textContent = \`
  img {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  img.loaded {
    opacity: 1;
  }
\`;
document.head.appendChild(style);`,
    },
    {
      id: 'skip-links',
      name: 'Skip Links',
      description: 'Add accessibility skip links',
      type: 'js',
      category: 'accessibility',
      code: `// Add skip to main content link
const skipLink = document.createElement('a');
skipLink.href = '#main';
skipLink.className = 'skip-link';
skipLink.textContent = 'Skip to main content';
skipLink.style.cssText = \`
  position: absolute;
  left: -9999px;
  top: 0;
  background: #667eea;
  color: white;
  padding: 1rem;
  z-index: 10000;
  text-decoration: none;
  font-weight: bold;
\`;

skipLink.addEventListener('focus', () => {
  skipLink.style.left = '0';
});

skipLink.addEventListener('blur', () => {
  skipLink.style.left = '-9999px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

// Add main landmark if not exists
if (!document.getElementById('main')) {
  const main = document.querySelector('main') || document.querySelector('body > *');
  if (main) {
    main.id = 'main';
    main.setAttribute('tabindex', '-1');
  }
}`,
    },
  ];

  private constructor() {}

  public static getInstance(): CustomInjectionService {
    if (!CustomInjectionService.instance) {
      CustomInjectionService.instance = new CustomInjectionService();
    }
    return CustomInjectionService.instance;
  }

  /**
   * Get all custom injections from storage
   */
  public getCustomInjections(): CustomInjection[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load custom injections:', error);
      return [];
    }
  }

  /**
   * Save custom injections to storage
   */
  public saveCustomInjections(injections: CustomInjection[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(injections));
    } catch (error) {
      console.error('Failed to save custom injections:', error);
    }
  }

  /**
   * Add a new custom injection
   */
  public addInjection(injection: Omit<CustomInjection, 'id'>): CustomInjection {
    const injections = this.getCustomInjections();
    const newInjection: CustomInjection = {
      ...injection,
      id: Date.now().toString(),
    };
    injections.push(newInjection);
    this.saveCustomInjections(injections);
    return newInjection;
  }

  /**
   * Update an existing injection
   */
  public updateInjection(id: string, updates: Partial<CustomInjection>): boolean {
    const injections = this.getCustomInjections();
    const index = injections.findIndex(i => i.id === id);
    
    if (index === -1) return false;
    
    injections[index] = { ...injections[index], ...updates };
    this.saveCustomInjections(injections);
    return true;
  }

  /**
   * Delete an injection
   */
  public deleteInjection(id: string): boolean {
    const injections = this.getCustomInjections();
    const filtered = injections.filter(i => i.id !== id);
    
    if (filtered.length === injections.length) return false;
    
    this.saveCustomInjections(filtered);
    return true;
  }

  /**
   * Toggle injection enabled state
   */
  public toggleInjection(id: string): boolean {
    const injections = this.getCustomInjections();
    const injection = injections.find(i => i.id === id);
    
    if (!injection) return false;
    
    injection.enabled = !injection.enabled;
    this.saveCustomInjections(injections);
    return true;
  }

  /**
   * Get all preset injections
   */
  public getPresetInjections(): PresetInjection[] {
    return this.presetInjections;
  }

  /**
   * Get presets by category
   */
  public getPresetsByCategory(category: PresetInjection['category']): PresetInjection[] {
    return this.presetInjections.filter(p => p.category === category);
  }

  /**
   * Search presets
   */
  public searchPresets(query: string): PresetInjection[] {
    const lowercaseQuery = query.toLowerCase();
    return this.presetInjections.filter(p =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Generate combined CSS/JS for preview injection
   */
  public generateInjectionCode(
    customInjections: CustomInjection[],
    selectedPresets: string[]
  ): { css: string; js: string } {
    const allInjections = [
      ...customInjections.filter(i => i.enabled),
      ...this.presetInjections.filter(p => selectedPresets.includes(p.id)),
    ];

    const css = allInjections
      .filter(i => i.type === 'css')
      .map(i => `/* ${i.name} */\n${i.code}`)
      .join('\n\n');

    const js = allInjections
      .filter(i => i.type === 'js')
      .map(i => `// ${i.name}\n${i.code}`)
      .join('\n\n');

    return { css, js };
  }
}

export const customInjectionService = CustomInjectionService.getInstance();
