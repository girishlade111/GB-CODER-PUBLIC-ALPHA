// Enhanced Code Templates Service with Lazy Loading
// Templates load on-demand for better performance

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory | 'plain' | 'react' | 'vue' | 'nextjs';
  subcategory?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  features?: string[];
  projectType: 'plain' | 'react' | 'vue' | 'nextjs';
  previewImage?: string;
  author?: string;
}

export type TemplateCategory = 
  | 'business' | 'ai-agents' | 'startup' | 'saas' | 'ecommerce' 
  | 'portfolio' | 'landing' | 'dashboard' | 'utility' | 'plain' | 'react' | 'vue' | 'nextjs';

export interface TemplateCategoryInfo {
  id: TemplateCategory;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategoryInfo[] = [
  { id: 'business', name: 'Business', icon: '💼', description: 'Professional business websites', color: 'blue' },
  { id: 'ai-agents', name: 'AI Agents', icon: '🤖', description: 'AI & automation tools', color: 'violet' },
  { id: 'startup', name: 'Startup', icon: '🚀', description: 'Modern startup landing pages', color: 'orange' },
  { id: 'saas', name: 'SaaS', icon: '🖥️', description: 'Software as a Service', color: 'pink' },
  { id: 'ecommerce', name: 'E-commerce', icon: '🛒', description: 'Online stores & shops', color: 'red' },
  { id: 'portfolio', name: 'Portfolio', icon: '🎨', description: 'Personal portfolios', color: 'yellow' },
  { id: 'landing', name: 'Landing Pages', icon: '📄', description: 'Marketing landing pages', color: 'teal' },
  { id: 'dashboard', name: 'Dashboard', icon: '📊', description: 'Admin & analytics dashboards', color: 'blue' },
  { id: 'utility', name: 'Utility', icon: '🔧', description: 'Tools & utilities', color: 'gray' },
  { id: 'plain', name: 'Plain HTML/CSS', icon: '🌐', description: 'Vanilla web templates', color: 'orange' },
  { id: 'react', name: 'React', icon: '⚛️', description: 'React applications', color: 'cyan' },
  { id: 'vue', name: 'Vue', icon: '💚', description: 'Vue applications', color: 'emerald' },
  { id: 'nextjs', name: 'Next.js', icon: '▲', description: 'Next.js applications', color: 'gray' },
];

// Import actual templates
import businessCorporate from './templates/business/corporate';
import aiChatbot from './templates/ai-agents/chatbot';
import startupLanding from './templates/startup/landing';
import saasDashboard from './templates/saas/dashboard';
import ecommerceStore from './templates/ecommerce/store';
import portfolioDeveloper from './templates/portfolio/developer';
import utilityCalculator from './templates/utility/calculator';

// New Templates
import plainBlog from './templates/plain/blog';
import plainAnimation from './templates/plain/animation';
import plainAuth from './templates/plain/auth';
import reactTodo from './templates/react/todo';
import reactWeather from './templates/react/weather';
import reactDashboard from './templates/react/dashboard';
import vueTasks from './templates/vue/tasks';
import nextjsBlog from './templates/nextjs/blog';

// Phase 2 Templates
import businessAgency from './templates/business/agency';
import businessConsulting from './templates/business/consulting';
import businessLocal from './templates/business/local';
import startupWaitlist from './templates/startup/waitlist';
import saasPricing from './templates/saas/pricing';

// Exported payload type
export type TemplatePayload = 
  | { html: string; css: string; javascript: string }
  | { files: { path: string; content: string }[] };


// Template registry with actual code
const templateRegistry: Record<string, TemplatePayload | (() => Promise<TemplatePayload>)> = {
  'business-corporate': businessCorporate,
  'ai-chatbot': aiChatbot,
  'startup-landing': startupLanding,
  'saas-dashboard': saasDashboard,
  'ecommerce-store': ecommerceStore,
  'portfolio-developer': portfolioDeveloper,
  'utility-calculator': utilityCalculator,
  'plain-blog': plainBlog,
  'plain-animation': plainAnimation,
  'plain-auth': plainAuth,
  'react-todo': reactTodo,
  'react-weather': reactWeather,
  'react-dashboard': reactDashboard,
  'vue-tasks': vueTasks,
  'nextjs-blog': nextjsBlog,
  'business-agency': businessAgency,
  'business-consulting': businessConsulting,
  'business-local': businessLocal,
  'startup-waitlist': startupWaitlist,
  'saas-pricing': saasPricing,
};

// Template metadata
const templateMetadata: Record<string, CodeTemplate> = {
  'business-agency': {
    id: 'business-agency',
    name: 'Digital Agency',
    description: 'Bold creative-studio site: kinetic headline reveal, gradient-mesh hero, client marquee and a 6-project portfolio grid with hover overlays.',
    category: 'business',
    subcategory: 'Agency',
    tags: ['agency', 'business', 'creative', 'portfolio', 'animation'],
    difficulty: 'intermediate',
    features: ['Animated gradient-mesh hero', 'Kinetic word-by-word headline', 'Client logo marquee', 'Services grid (6)', 'Portfolio grid with hover overlays', 'Stats band with counters', 'Process timeline', 'Testimonial slider', 'Contact form with validation'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'business-consulting': {
    id: 'business-consulting',
    name: 'Financial Consulting',
    description: 'Enterprise advisory firm site with an animated market ticker, 4-step process timeline, case-study results and 9 animated counters.',
    category: 'business',
    subcategory: 'Consulting',
    tags: ['finance', 'business', 'consulting', 'corporate', 'advisory'],
    difficulty: 'intermediate',
    features: ['Market ticker strip', 'Scroll-spy navigation', 'Services grid (6)', 'Animated process timeline', 'Case studies with counters', 'Insights list', 'Team grid (4)', 'FAQ accordion', 'Validated contact form'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'business-local': {
    id: 'business-local',
    name: 'Local Cafe & Bakery',
    description: 'Warm, appetising cafe site: filterable menu, baked-goods gallery, reviews carousel with autoplay and a validated reservation form.',
    category: 'business',
    subcategory: 'Local',
    tags: ['cafe', 'restaurant', 'bakery', 'local', 'food'],
    difficulty: 'intermediate',
    features: ['Steam animation on hero art', 'Opening hours and location card', 'Category-tabbed menu (19 items)', 'Baked-goods grid', 'Reviews carousel with autoplay', 'Instagram-style gallery', 'Our-story split section', 'Validated reservation form', 'Full footer with hours'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'startup-waitlist': {
    id: 'startup-waitlist',
    name: 'Product Waitlist',
    description: 'Striking glassmorphic waitlist page with gradient-mesh background, live signup counter, referral-code generator and a ticking launch countdown.',
    category: 'startup',
    subcategory: 'Waitlist',
    tags: ['startup', 'waitlist', 'glassmorphism', 'launch', 'referral'],
    difficulty: 'intermediate',
    features: ['Animated gradient mesh + grain', 'Floating orb ambient layer', 'Kinetic headline', 'Email validation with duplicate detection', 'Referral-code generator + copy button', 'Live signup-position counter', 'Animated avatar stack', 'Launch countdown ticker', 'FAQ accordion (4)'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'saas-pricing': {
    id: 'saas-pricing',
    name: 'SaaS Pricing',
    description: 'Complete pricing page with a working monthly/yearly toggle, 4 tiers, a 3-state feature comparison table and an animated conic-gradient ring.',
    category: 'saas',
    subcategory: 'Pricing',
    tags: ['saas', 'pricing', 'billing', 'comparison', 'subscription'],
    difficulty: 'intermediate',
    features: ['Monthly/yearly billing toggle', 'Animated price tweening', '4 tiers, 9 features each', '3-state feature indicators', 'Animated conic-gradient featured tier', 'Comparison table (differences-only mode)', 'Money-back guarantee strip', 'Trust badges', 'FAQ accordion (6)'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'business-corporate': {
    id: 'business-corporate',
    name: 'Corporate Business',
    description: 'Full enterprise corporate site: sticky header with dropdowns, scroll-spy, logo marquee, 6 services, leadership grid and a 10-section layout.',
    category: 'business',
    subcategory: 'Corporate',
    tags: ['business', 'corporate', 'enterprise', 'professional'],
    difficulty: 'advanced',
    features: ['Sticky header with scroll progress', 'Dropdown navigation', 'Scroll-spy over 6 sections', 'Kinetic headline', 'Animated counters', 'Client logo marquee', 'Services grid (6)', 'Leadership grid (4)', 'Testimonials (3)', 'Fully validated contact form'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'ai-chatbot': {
    id: 'ai-chatbot',
    name: 'AI Chatbot',
    description: 'Enterprise AI chat interface: conversation sidebar, simulated streaming replies, custom markdown renderer, code blocks and a script-response engine.',
    category: 'ai-agents',
    subcategory: 'Chatbot',
    tags: ['ai', 'chatbot', 'conversation', 'streaming', 'markdown'],
    difficulty: 'advanced',
    features: ['7-thread conversation sidebar', 'Simulated streaming responses', 'Custom markdown renderer', 'Code blocks with copy button', 'Typing and thinking indicators', 'Copy / regenerate / thumbs actions', 'Suggestion chips', 'Scroll-to-bottom FAB', 'Auto / light / dark theme toggle'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'startup-landing': {
    id: 'startup-landing',
    name: 'Startup Landing Page',
    description: 'Full startup launch page: kinetic hero, logo marquee, interactive product tabs, testimonial slider, pricing preview and FAQ accordion.',
    category: 'startup',
    subcategory: 'Landing',
    tags: ['startup', 'landing', 'saas', 'launch', 'marketing'],
    difficulty: 'advanced',
    features: ['Kinetic per-word headline', 'Product visual hero', 'Logo marquee', 'Interactive product tab-switcher', 'How-it-works 3-step', 'Metrics band with counters', 'Testimonial slider with autoplay', 'Pricing preview with billing toggle', 'FAQ accordion', 'Full footer'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'saas-dashboard': {
    id: 'saas-dashboard',
    name: 'SaaS Dashboard',
    description: 'Complete admin dashboard: collapsible sidebar, 4 KPI cards with sparklines, hand-built SVG area/bar/donut charts with hover tooltips and a sortable table.',
    category: 'saas',
    subcategory: 'Dashboard',
    tags: ['saas', 'dashboard', 'admin', 'analytics', 'charts'],
    difficulty: 'advanced',
    features: ['Collapsible sidebar with groups', 'Topbar with search and dropdowns', '4 KPI cards with sparklines', 'SVG area chart with hover tooltip', 'Animated bar chart', 'Donut chart via stroke-dasharray', 'Sortable data table with badges', 'Activity feed with filter', 'Date-range selector driving all metrics'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'ecommerce-store': {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Northport Supply Co.: 12 products, working cart drawer with localStorage, 4 promo codes, wishlist, product modal, quick-view and flying-cart animation.',
    category: 'ecommerce',
    subcategory: 'Store',
    tags: ['ecommerce', 'store', 'shop', 'cart', 'commerce'],
    difficulty: 'advanced',
    features: ['Slide-over cart drawer (localStorage)', 'Category filter + search + 5 sorts', '4 validating promo codes', 'Free-shipping meter', 'Stock-capped quantity steppers', 'Flying-cart Web Animation', 'Wishlist with badge', 'Product modal with focus trap', 'Hover quick-view', 'Recently-viewed rail'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'portfolio-developer': {
    id: 'portfolio-developer',
    name: 'Developer Portfolio',
    description: 'Engineer portfolio: terminal typing hero, animated skill meters, 6 case-study modals, expandable timeline and a seeded GitHub contribution heatmap.',
    category: 'portfolio',
    subcategory: 'Developer',
    tags: ['portfolio', 'developer', 'resume', 'heatmap', 'dark-mode'],
    difficulty: 'intermediate',
    features: ['Terminal typing animation', 'Animated skill proficiency meters', 'Filterable skill grid', '6 case-study modals with focus trap', 'Expandable experience timeline', 'Seeded contribution heatmap', 'Testimonial carousel', 'Notes list', 'Light/dark theme toggle', 'Validated contact form'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'utility-calculator': {
    id: 'utility-calculator',
    name: 'Calculator App',
    description: 'Slate calculator with a hand-written tokenizer and recursive-descent parser (no eval), memory registers, settings and live converters.',
    category: 'utility',
    subcategory: 'Calculator',
    tags: ['calculator', 'math', 'parser', 'utility', 'tool'],
    difficulty: 'advanced',
    features: ['Recursive-descent expression parser', 'No eval / Function constructor', 'Full keyboard input support', 'Memory registers MC/MR/M+/M-', 'Click-to-reuse history', 'DEG/RAD angle mode', 'Thousands separators + precision', '8 live converters', '6 one-tap recipes', 'Clipboard with fallback'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'plain-blog': {
    id: 'plain-blog',
    name: 'Editorial Blog',
    description: 'Complete editorial blog: featured post, filterable 6-post grid with reading-progress bar, category chips, sidebar picks, author meta and newsletter band.',
    category: 'plain',
    subcategory: 'Blog',
    tags: ['blog', 'editorial', 'content', 'magazine', 'reading'],
    difficulty: 'intermediate',
    features: ['Sticky header with nav and search', 'Reading-progress bar', 'Featured hero post', 'Filterable 6-post grid', 'Category filter chips', 'Tag pills', 'Editor picks sidebar', 'Author / date / read-time meta', 'Newsletter CTA band', 'Back-to-top'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'plain-animation': {
    id: 'plain-animation',
    name: 'Animation Showcase',
    description: 'A motion reference page: entrance reveals, hover micro-interactions, ambient loops, loading skeletons, scroll meters, magnetic buttons and toast demos — each replayable.',
    category: 'plain',
    subcategory: 'Animation',
    tags: ['animation', 'css', 'motion', 'keyframes', 'showcase'],
    difficulty: 'advanced',
    features: ['24 @keyframes across 7 demo stages', 'Entrance / reveal animations', 'Hover micro-interactions', 'Ambient floating orbs', 'Skeleton shimmer + spinner variants', 'Scroll-triggered progress meters', 'Magnetic button + ripple click', '4 toast notification kinds', 'Per-demo replay controls', 'Reduced-motion guidance'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'plain-auth': {
    id: 'plain-auth',
    name: 'Login / Signup',
    description: 'Split-screen authentication page: brand panel with social proof plus working login and signup forms with full client-side validation and password visibility toggles.',
    category: 'plain',
    subcategory: 'Auth',
    tags: ['auth', 'login', 'signup', 'form', 'validation'],
    difficulty: 'intermediate',
    features: ['Split brand / form layout', 'Working login + signup tabs', 'Email format validation', 'Confirm-password matching', 'Password length rules', 'Show/hide password toggles', 'Social login buttons', 'Remember me + forgot password', 'Trust badges and testimonial', 'FAQ (5)'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'react-todo': {
    id: 'react-todo',
    name: 'React Task Manager',
    description: 'Production-grade React task manager: 14 files, 8 components, priorities, due dates, filters, search, sort, reorder, undo and localStorage persistence.',
    category: 'react',
    subcategory: 'Utility',
    tags: ['react', 'todo', 'state', 'hooks', 'crud'],
    difficulty: 'advanced',
    features: ['8 split-out components', 'Custom useTasks hook + store', 'Priorities and due dates', 'Overdue detection', 'Filter, search and sort', 'Inline editing', 'Bulk toggle and clear', 'Up/down reorder', 'Undo on delete', 'localStorage persistence'],
    projectType: 'react',
    author: 'GB Coder',
  },
  'react-weather': {
    id: 'react-weather',
    name: 'React Weather Dashboard',
    description: 'Multi-city weather dashboard with a C/F toggle, hand-drawn SVG bar chart, animated condition icons, metric tiles and sunrise/sunset arc — 6 cities, zero network.',
    category: 'react',
    subcategory: 'Dashboard',
    tags: ['react', 'weather', 'widget', 'charts', 'svg'],
    difficulty: 'advanced',
    features: ['6 cities of static data', 'Celsius / Fahrenheit toggle', 'Combobox city search', '8 animated SVG weather icons', '7-day forecast strip', 'Hand-computed SVG bar chart', 'Sunrise / sunset arc', 'Metric tiles (wind, UV, pressure)', 'Day-night gradient theming', 'Skeleton loading state'],
    projectType: 'react',
    author: 'GB Coder',
  },
  'react-dashboard': {
    id: 'react-dashboard',
    name: 'React Admin Dashboard',
    description: 'Admin shell with collapsible sidebar, topbar dropdowns, KPI sparklines, a hand-written SVG area chart with hover tooltip, and a sortable data table.',
    category: 'react',
    subcategory: 'Dashboard',
    tags: ['react', 'dashboard', 'layout', 'charts', 'admin'],
    difficulty: 'advanced',
    features: ['9 split-out components', 'Collapsible rail + phone drawer', 'Topbar search with keyboard nav', 'Notification and user menus', '4 KPI cards with sparklines', 'Hand-written SVG area chart', 'Nearest-point hover tooltip', 'Sortable paginated table', 'Activity feed', '360px to 1440px responsive'],
    projectType: 'react',
    author: 'GB Coder',
  },
  'vue-tasks': {
    id: 'vue-tasks',
    name: 'Vue Task Manager',
    description: 'Vue 3 Composition API task app using script setup across 6 SFCs, with an SVG progress ring, tag chips, undo toast and localStorage persistence.',
    category: 'vue',
    subcategory: 'Utility',
    tags: ['vue', 'task', 'manager', 'composition-api'],
    difficulty: 'advanced',
    features: ['6 Vue SFCs with script setup', 'Composable useTasks', 'ref / computed / reactive / watch', 'SVG progress ring', 'SVG bar sparkline', 'Tag add and remove', 'Multi-remove undo toast', 'Inline edit with Enter and Escape', 'localStorage persistence', 'Skeleton and empty states'],
    projectType: 'vue',
    author: 'GB Coder',
  },
  'nextjs-blog': {
    id: 'nextjs-blog',
    name: 'Next.js Blog Starter',
    description: 'App-Router-shaped React blog: nested layouts, a dynamic [slug] route, a hand-written markdown renderer, scroll-spy TOC and a History-API router.',
    category: 'nextjs',
    subcategory: 'Blog',
    tags: ['nextjs', 'react', 'blog', 'app-router', 'markdown'],
    difficulty: 'advanced',
    features: ['App Router folder structure', 'Nested layout + page composition', 'Dynamic [slug] route simulation', 'generateStaticParams equivalent', 'notFound() handling', 'Hand-written markdown parser', 'Auto table of contents with scroll-spy', 'Frontmatter post dataset', 'Tag filtering and search', 'History-API back/forward navigation'],
    projectType: 'react', // App Router conventions, emulated client-side so it runs in the playground.
    author: 'GB Coder',
  },
};

class EnhancedTemplateService {
  private static instance: EnhancedTemplateService;

  private constructor() {
    this.loadCustomTemplates();
  }

  public static getInstance(): EnhancedTemplateService {
    if (!EnhancedTemplateService.instance) {
      EnhancedTemplateService.instance = new EnhancedTemplateService();
    }
    return EnhancedTemplateService.instance;
  }

  private loadCustomTemplates() {
    try {
      const stored = localStorage.getItem('gbcoder_custom_templates');
      if (stored) {
        const customTemplates = JSON.parse(stored) as CodeTemplate[];
        customTemplates.forEach(t => {
          templateMetadata[t.id] = t;
        });
      }
    } catch (err) {
      console.warn('Failed to load custom templates', err);
    }
  }

  public saveCustomTemplate(template: CodeTemplate, payload: TemplatePayload) {
    templateMetadata[template.id] = template;
    templateRegistry[template.id] = payload;
    
    // Persist metadata and payload to localStorage
    try {
      const stored = localStorage.getItem('gbcoder_custom_templates') || '[]';
      const customTemplates = JSON.parse(stored) as (CodeTemplate & { payload: TemplatePayload })[];
      // We store both metadata and payload in localStorage for custom templates
      const existingIdx = customTemplates.findIndex(t => t.id === template.id);
      const dataToStore = { ...template, payload };
      
      if (existingIdx >= 0) {
        customTemplates[existingIdx] = dataToStore;
      } else {
        customTemplates.push(dataToStore);
      }
      localStorage.setItem('gbcoder_custom_templates', JSON.stringify(customTemplates));
    } catch (err) {
      console.error('Failed to save custom template', err);
    }
  }

  public getCustomTemplates(): CodeTemplate[] {
    try {
      const stored = localStorage.getItem('gbcoder_custom_templates');
      if (stored) {
        const customTemplates = JSON.parse(stored) as (CodeTemplate & { payload: TemplatePayload })[];
        // Return just metadata
        return customTemplates.map(t => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { payload, ...meta } = t;
          return meta as CodeTemplate;
        });
      }
    } catch (err) {
      console.warn('Failed to parse custom templates', err);
    }
    return [];
  }

  public deleteCustomTemplate(id: string) {
    delete templateMetadata[id];
    delete templateRegistry[id];
    try {
      const stored = localStorage.getItem('gbcoder_custom_templates');
      if (stored) {
        const customTemplates = JSON.parse(stored) as (CodeTemplate & { payload: TemplatePayload })[];
        const filtered = customTemplates.filter(t => t.id !== id);
        localStorage.setItem('gbcoder_custom_templates', JSON.stringify(filtered));
      }
    } catch (err) {
      console.error('Failed to delete custom template', err);
    }
  }

  public registerTemplate(meta: CodeTemplate, payload: TemplatePayload | (() => Promise<TemplatePayload>)) {
    templateMetadata[meta.id] = meta;
    templateRegistry[meta.id] = payload;
  }

  /**
   * Get all template metadata
   */
  public getAllTemplatesMetadata(): CodeTemplate[] {
    return Object.values(templateMetadata);
  }

  /**
   * Get templates by category
   */
  public getTemplatesByCategory(category: TemplateCategory): CodeTemplate[] {
    return Object.values(templateMetadata).filter(t => t.category === category);
  }

  /**
   * Search templates
   */
  public searchTemplates(query: string): CodeTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return Object.values(templateMetadata).filter(t =>
      t.name.toLowerCase().includes(lowercaseQuery) ||
      t.description.toLowerCase().includes(lowercaseQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      t.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get template code by ID (lazy loaded)
   */
  public async getTemplateById(id: string): Promise<TemplatePayload | null> {
    try {
      // For custom templates stored in localStorage
      if (!templateRegistry[id]) {
        const stored = localStorage.getItem('gbcoder_custom_templates');
        if (stored) {
          const customTemplates = JSON.parse(stored) as (CodeTemplate & { payload: TemplatePayload })[];
          const found = customTemplates.find(t => t.id === id);
          if (found && found.payload) {
            return found.payload;
          }
        }
      }

      const templateCode = templateRegistry[id];
      if (!templateCode) {
        console.error(`Template not found: ${id}`);
        return null;
      }
      
      if (typeof templateCode === 'function') {
        return await templateCode();
      }
      
      return templateCode;
    } catch (error) {
      console.error(`Failed to load template ${id}:`, error);
      return null;
    }
  }

  /**
   * Get categories with counts
   */
  public getCategoriesWithCounts(): Array<TemplateCategoryInfo & { count: number }> {
    return TEMPLATE_CATEGORIES.map(cat => ({
      ...cat,
      count: Object.values(templateMetadata).filter(t => t.category === cat.id).length,
    }));
  }

  /**
   * Get template stats
   */
  public getStats() {
    const all = Object.values(templateMetadata);
    return {
      total: all.length,
      categories: Object.keys(templateRegistry).length,
    };
  }
}

export const enhancedTemplateService = EnhancedTemplateService.getInstance();
