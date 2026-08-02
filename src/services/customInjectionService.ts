// Custom CSS/JS/HTML Injection Service for Preview Customization

export type InjectionType = 'css' | 'js' | 'html';
export type InjectionTarget = 'head' | 'before-body' | 'after-body' | 'inline';

export interface CustomInjection {
  id: string;
  name: string;
  type: InjectionType;
  target: InjectionTarget;
  code: string;
  enabled: boolean;
  applyToExport: boolean;
  order: number;
  description?: string;
  isPreset?: boolean;
}

export interface PresetInjection {
  id: string;
  name: string;
  description: string;
  version: string;
  iconUrl?: string; // Optional icon url or icon name
  type: InjectionType;
  target: InjectionTarget;
  code: string;
  category: 'CSS Frameworks' | 'UI Libraries' | 'JS Utilities' | 'Visualization' | 'Animation' | 'Meta/SEO' | 'Analytics' | 'Debug' | 'Accessibility';
}

class CustomInjectionService {
  private static instance: CustomInjectionService;
  
  private presetInjections: PresetInjection[] = [
    // CSS Frameworks
    {
      id: 'tailwind-css',
      name: 'Tailwind CSS',
      description: 'Utility-first CSS framework (via CDN)',
      version: '3.4.1',
      type: 'html',
      target: 'head',
      category: 'CSS Frameworks',
      code: '<script src="https://cdn.tailwindcss.com"></script>'
    },
    {
      id: 'bootstrap-5',
      name: 'Bootstrap 5',
      description: 'The most popular HTML, CSS, and JS library in the world.',
      version: '5.3.2',
      type: 'html',
      target: 'head',
      category: 'CSS Frameworks',
      code: '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">\n<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>'
    },
    {
      id: 'bulma',
      name: 'Bulma',
      description: 'Free, open source, and modern CSS framework based on Flexbox.',
      version: '0.9.4',
      type: 'html',
      target: 'head',
      category: 'CSS Frameworks',
      code: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">'
    },
    {
      id: 'materialize',
      name: 'Materialize',
      description: 'A modern responsive front-end framework based on Material Design.',
      version: '1.0.0',
      type: 'html',
      target: 'head',
      category: 'CSS Frameworks',
      code: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">\n<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>'
    },
    
    // UI Libraries
    {
      id: 'font-awesome',
      name: 'Font Awesome 6',
      description: 'The web\'s most popular icon set and toolkit.',
      version: '6.4.2',
      type: 'html',
      target: 'head',
      category: 'UI Libraries',
      code: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">'
    },
    {
      id: 'lucide-icons',
      name: 'Lucide Icons',
      description: 'Beautiful & consistent icons (via unpkg).',
      version: '0.292.0',
      type: 'html',
      target: 'head',
      category: 'UI Libraries',
      code: '<script src="https://unpkg.com/lucide@latest"></script>\n<script>lucide.createIcons();</script>'
    },
    {
      id: 'google-fonts-inter',
      name: 'Google Fonts: Inter',
      description: 'Inter font family.',
      version: 'latest',
      type: 'html',
      target: 'head',
      category: 'UI Libraries',
      code: '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">'
    },
    {
      id: 'material-icons',
      name: 'Material Icons',
      description: 'Google Material Design Icons.',
      version: 'latest',
      type: 'html',
      target: 'head',
      category: 'UI Libraries',
      code: '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">'
    },

    // JS Utilities
    {
      id: 'jquery',
      name: 'jQuery',
      description: 'Fast, small, and feature-rich JavaScript library.',
      version: '3.7.1',
      type: 'html',
      target: 'head',
      category: 'JS Utilities',
      code: '<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>'
    },
    {
      id: 'lodash',
      name: 'Lodash',
      description: 'A modern JavaScript utility library delivering modularity, performance & extras.',
      version: '4.17.21',
      type: 'html',
      target: 'head',
      category: 'JS Utilities',
      code: '<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>'
    },
    {
      id: 'dayjs',
      name: 'Day.js',
      description: 'Fast 2kB alternative to Moment.js.',
      version: '1.11.10',
      type: 'html',
      target: 'head',
      category: 'JS Utilities',
      code: '<script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>'
    },
    {
      id: 'axios',
      name: 'Axios',
      description: 'Promise based HTTP client for the browser and node.js.',
      version: '1.6.2',
      type: 'html',
      target: 'head',
      category: 'JS Utilities',
      code: '<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>'
    },

    // Visualization
    {
      id: 'threejs',
      name: 'Three.js',
      description: 'JavaScript 3D library.',
      version: '0.158.0',
      type: 'html',
      target: 'head',
      category: 'Visualization',
      code: '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
    },
    {
      id: 'chartjs',
      name: 'Chart.js',
      description: 'Simple yet flexible JavaScript charting for designers & developers.',
      version: '4.4.0',
      type: 'html',
      target: 'head',
      category: 'Visualization',
      code: '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>'
    },
    {
      id: 'd3js',
      name: 'D3.js',
      description: 'Data-Driven Documents.',
      version: '7.8.5',
      type: 'html',
      target: 'head',
      category: 'Visualization',
      code: '<script src="https://d3js.org/d3.v7.min.js"></script>'
    },
    {
      id: 'p5js',
      name: 'p5.js',
      description: 'p5.js is a JS client-side library for creating graphic and interactive experiences.',
      version: '1.9.0',
      type: 'html',
      target: 'head',
      category: 'Visualization',
      code: '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js"></script>'
    },

    // Animation
    {
      id: 'gsap',
      name: 'GSAP',
      description: 'Professional-grade JavaScript animation for the modern web.',
      version: '3.12.2',
      type: 'html',
      target: 'head',
      category: 'Animation',
      code: '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>'
    },
    {
      id: 'animejs',
      name: 'Anime.js',
      description: 'Lightweight JavaScript animation library.',
      version: '3.2.1',
      type: 'html',
      target: 'head',
      category: 'Animation',
      code: '<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>'
    },
    {
      id: 'lottie-web',
      name: 'Lottie Web',
      description: 'Render After Effects animations natively on Web.',
      version: '5.12.2',
      type: 'html',
      target: 'head',
      category: 'Animation',
      code: '<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>'
    },
    {
      id: 'fade-in',
      name: 'Fade In Animation',
      description: 'Smooth fade-in animation',
      version: '1.0',
      type: 'css',
      target: 'inline',
      category: 'Animation',
      code: `@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}`
    },

    // Meta/SEO
    {
      id: 'open-graph',
      name: 'Open Graph Boilerplate',
      description: 'Basic Open Graph meta tags for social sharing.',
      version: '1.0',
      type: 'html',
      target: 'head',
      category: 'Meta/SEO',
      code: '<meta property="og:title" content="My Project">\n<meta property="og:description" content="A description of my project">\n<meta property="og:image" content="https://example.com/image.jpg">\n<meta property="og:url" content="https://example.com">'
    },
    {
      id: 'twitter-card',
      name: 'Twitter Card Boilerplate',
      description: 'Basic Twitter Card meta tags.',
      version: '1.0',
      type: 'html',
      target: 'head',
      category: 'Meta/SEO',
      code: '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="My Project">\n<meta name="twitter:description" content="A description of my project">\n<meta name="twitter:image" content="https://example.com/image.jpg">'
    },
    {
      id: 'favicon-template',
      name: 'Favicon Template',
      description: 'Standard favicon link tags.',
      version: '1.0',
      type: 'html',
      target: 'head',
      category: 'Meta/SEO',
      code: '<link rel="icon" href="/favicon.ico" type="image/x-icon">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">'
    },

    // Analytics
    {
      id: 'ga4',
      name: 'Google Analytics 4',
      description: 'Google Analytics 4 tracking snippet (replace G-XXXXX).',
      version: 'latest',
      type: 'html',
      target: 'head',
      category: 'Analytics',
      code: '<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag("js", new Date());\n  gtag("config", "G-XXXXXXXXXX");\n</script>'
    },
    {
      id: 'plausible',
      name: 'Plausible Analytics',
      description: 'Privacy-friendly analytics snippet.',
      version: 'latest',
      type: 'html',
      target: 'head',
      category: 'Analytics',
      code: '<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>'
    },
    {
      id: 'umami',
      name: 'Umami Analytics',
      description: 'Simple, fast, privacy-focused alternative to GA.',
      version: 'latest',
      type: 'html',
      target: 'head',
      category: 'Analytics',
      code: '<script async src="https://analytics.umami.is/script.js" data-website-id="YOUR-WEBSITE-ID"></script>'
    },
  ];

  private constructor() {}

  public static getInstance(): CustomInjectionService {
    if (!CustomInjectionService.instance) {
      CustomInjectionService.instance = new CustomInjectionService();
    }
    return CustomInjectionService.instance;
  }

  private getStorageKey(projectId?: string): string {
    return projectId ? `gb-coder-custom-injections-${projectId}` : 'gb-coder-custom-injections-global';
  }

  /**
   * Get all custom injections from storage for a specific project
   */
  public getCustomInjections(projectId?: string): CustomInjection[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(projectId));
      let injections: CustomInjection[] = stored ? JSON.parse(stored) : [];
      // Ensure all loaded injections have required fields
      injections = injections.map((i, index) => ({
        ...i,
        target: i.target || (i.type === 'html' ? 'head' : 'inline'),
        applyToExport: i.applyToExport ?? false,
        order: typeof i.order === 'number' ? i.order : index
      }));
      // Sort by order
      injections.sort((a, b) => a.order - b.order);
      return injections;
    } catch (error) {
      console.error('Failed to load custom injections:', error);
      return [];
    }
  }

  /**
   * Save custom injections to storage for a specific project
   */
  public saveCustomInjections(injections: CustomInjection[], projectId?: string): void {
    try {
      // Ensure order matches array index if not set properly
      const ordered = injections.map((i, index) => ({ ...i, order: index }));
      localStorage.setItem(this.getStorageKey(projectId), JSON.stringify(ordered));
    } catch (error) {
      console.error('Failed to save custom injections:', error);
    }
  }

  /**
   * Add a new custom injection
   */
  public addInjection(injection: Omit<CustomInjection, 'id' | 'order'>, projectId?: string): CustomInjection {
    const injections = this.getCustomInjections(projectId);
    const newInjection: CustomInjection = {
      ...injection,
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      order: injections.length,
    };
    injections.push(newInjection);
    this.saveCustomInjections(injections, projectId);
    return newInjection;
  }
  
  /**
   * Add a preset injection to active list
   */
  public addPreset(presetId: string, projectId?: string): CustomInjection | null {
    const preset = this.presetInjections.find(p => p.id === presetId);
    if (!preset) return null;
    
    return this.addInjection({
      name: preset.name,
      type: preset.type,
      target: preset.target,
      code: preset.code,
      enabled: true,
      applyToExport: false,
      description: preset.description,
      isPreset: true,
    }, projectId);
  }

  /**
   * Update an existing injection
   */
  public updateInjection(id: string, updates: Partial<CustomInjection>, projectId?: string): boolean {
    const injections = this.getCustomInjections(projectId);
    const index = injections.findIndex(i => i.id === id);
    
    if (index === -1) return false;
    
    injections[index] = { ...injections[index], ...updates };
    this.saveCustomInjections(injections, projectId);
    return true;
  }

  /**
   * Delete an injection
   */
  public deleteInjection(id: string, projectId?: string): boolean {
    const injections = this.getCustomInjections(projectId);
    const filtered = injections.filter(i => i.id !== id);
    
    if (filtered.length === injections.length) return false;
    
    this.saveCustomInjections(filtered, projectId);
    return true;
  }

  /**
   * Toggle injection enabled state
   */
  public toggleInjection(id: string, projectId?: string): boolean {
    const injections = this.getCustomInjections(projectId);
    const injection = injections.find(i => i.id === id);
    
    if (!injection) return false;
    
    injection.enabled = !injection.enabled;
    this.saveCustomInjections(injections, projectId);
    return true;
  }
  
  /**
   * Reorder injections
   */
  public reorderInjections(startIndex: number, endIndex: number, projectId?: string): void {
    const injections = this.getCustomInjections(projectId);
    const [removed] = injections.splice(startIndex, 1);
    injections.splice(endIndex, 0, removed);
    this.saveCustomInjections(injections, projectId);
  }
  
  public resetToDefaults(projectId?: string): void {
    this.saveCustomInjections([], projectId);
  }

  /**
   * Get all preset injections
   */
  public getPresetInjections(): PresetInjection[] {
    return this.presetInjections;
  }

  /**
   * Search presets
   */
  public searchPresets(query: string): PresetInjection[] {
    if (!query) return this.presetInjections;
    const lowercaseQuery = query.toLowerCase();
    return this.presetInjections.filter(p =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  /**
   * Sanitize injection code based on type
   */
  public sanitizeCode(code: string, type: InjectionType): string {
    if (type === 'css') {
      // Very basic stripping of script tags from CSS
        return code.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                 .replace(/javascript:/gi, '');
    }
    return code;
  }
  
  /**
   * Check if JS code is potentially unsafe (e.g. document.write)
   */
  public checkUnsafeJS(code: string): string[] {
    const warnings: string[] = [];
    if (code.includes('document.write')) {
      warnings.push('Warning: document.write can overwrite the entire preview document.');
    }
    if (code.includes('while(true)') || code.includes('while (true)')) {
      warnings.push('Warning: Infinite loops may crash the preview.');
    }
    return warnings;
  }
}

export const customInjectionService = CustomInjectionService.getInstance();
