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
    description: 'Modern digital agency landing page with portfolio showcase.',
    category: 'business',
    subcategory: 'Agency',
    tags: ['agency', 'business', 'modern', 'digital'],
    difficulty: 'intermediate',
    features: ['Hero Image', 'Services', 'Animations'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'business-consulting': {
    id: 'business-consulting',
    name: 'Financial Consulting',
    description: 'Professional financial consulting firm template.',
    category: 'business',
    subcategory: 'Consulting',
    tags: ['finance', 'business', 'consulting', 'corporate'],
    difficulty: 'beginner',
    features: ['Sidebar Layout', 'Services Cards', 'Hero Banner'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'business-local': {
    id: 'business-local',
    name: 'Local Cafe & Bakery',
    description: 'Aesthetic local cafe and bakery template.',
    category: 'business',
    subcategory: 'Local',
    tags: ['cafe', 'restaurant', 'local', 'food'],
    difficulty: 'beginner',
    features: ['Image Grid', 'Menu Link', 'Order Button'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'startup-waitlist': {
    id: 'startup-waitlist',
    name: 'Product Waitlist',
    description: 'Modern glassmorphic waitlist page for upcoming startups.',
    category: 'startup',
    subcategory: 'Waitlist',
    tags: ['startup', 'waitlist', 'glassmorphism', 'modern'],
    difficulty: 'intermediate',
    features: ['Glass Container', 'Input Form', 'Animated Blobs'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'saas-pricing': {
    id: 'saas-pricing',
    name: 'SaaS Pricing',
    description: 'Clean SaaS pricing table with prominent Pro plan.',
    category: 'saas',
    subcategory: 'Pricing',
    tags: ['saas', 'pricing', 'table', 'subscription'],
    difficulty: 'beginner',
    features: ['Pricing Grid', 'Hover Effects', 'Call to Action'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'business-corporate': {
    id: 'business-corporate',
    name: 'Corporate Business',
    description: 'Professional corporate website with modern design',
    category: 'business',
    subcategory: 'Corporate',
    tags: ['business', 'corporate', 'professional', 'responsive'],
    difficulty: 'intermediate',
    features: ['Hero Section', 'Services', 'Team', 'Contact Form', 'About Us'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'ai-chatbot': {
    id: 'ai-chatbot',
    name: 'AI Chatbot',
    description: 'AI-powered chatbot interface',
    category: 'ai-agents',
    subcategory: 'Chatbot',
    tags: ['ai', 'chatbot', 'conversation', 'automation'],
    difficulty: 'advanced',
    features: ['Chat Interface', 'AI Responses', 'History', 'Settings'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'startup-landing': {
    id: 'startup-landing',
    name: 'Startup Landing Page',
    description: 'Modern startup landing page with pricing and features',
    category: 'startup',
    subcategory: 'Landing',
    tags: ['startup', 'landing', 'saas', 'modern'],
    difficulty: 'intermediate',
    features: ['Hero', 'Features', 'Pricing', 'Testimonials', 'CTA'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'saas-dashboard': {
    id: 'saas-dashboard',
    name: 'SaaS Dashboard',
    description: 'Complete SaaS admin dashboard with analytics',
    category: 'saas',
    subcategory: 'Dashboard',
    tags: ['saas', 'dashboard', 'admin', 'analytics'],
    difficulty: 'advanced',
    features: ['Sidebar', 'Stats', 'Charts', 'Activity Feed'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'ecommerce-store': {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Full-featured online store with cart and products',
    category: 'ecommerce',
    subcategory: 'Store',
    tags: ['ecommerce', 'store', 'shop', 'cart'],
    difficulty: 'advanced',
    features: ['Product Grid', 'Shopping Cart', 'Categories', 'Search'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'portfolio-developer': {
    id: 'portfolio-developer',
    name: 'Developer Portfolio',
    description: 'Professional developer portfolio with projects',
    category: 'portfolio',
    subcategory: 'Developer',
    tags: ['portfolio', 'developer', 'projects', 'resume'],
    difficulty: 'intermediate',
    features: ['About', 'Skills', 'Projects', 'Contact'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'utility-calculator': {
    id: 'utility-calculator',
    name: 'Calculator App',
    description: 'Beautiful calculator with history tracking',
    category: 'utility',
    subcategory: 'Calculator',
    tags: ['calculator', 'math', 'utility', 'tool'],
    difficulty: 'beginner',
    features: ['Basic Operations', 'History', 'Keyboard Support'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'plain-blog': {
    id: 'plain-blog',
    name: 'Vanilla Blog Layout',
    description: 'Classic plain HTML/CSS blog layout template.',
    category: 'plain',
    subcategory: 'Blog',
    tags: ['blog', 'layout', 'content'],
    difficulty: 'beginner',
    features: ['Header', 'Article layout', 'Responsive CSS'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'plain-animation': {
    id: 'plain-animation',
    name: 'Animation Showcase',
    description: 'A pure CSS animation template.',
    category: 'plain',
    subcategory: 'Animation',
    tags: ['animation', 'css', 'hover'],
    difficulty: 'beginner',
    features: ['CSS transitions', 'Hover effects'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'plain-auth': {
    id: 'plain-auth',
    name: 'Login/Signup',
    description: 'Vanilla authentication form template.',
    category: 'plain',
    subcategory: 'Auth',
    tags: ['auth', 'form', 'login'],
    difficulty: 'beginner',
    features: ['Form layout', 'Basic validation'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'react-todo': {
    id: 'react-todo',
    name: 'React Todo App',
    description: 'A classic Todo application in React.',
    category: 'react',
    subcategory: 'Utility',
    tags: ['react', 'todo', 'state'],
    difficulty: 'beginner',
    features: ['useState', 'List rendering', 'Controlled inputs'],
    projectType: 'react',
    author: 'GB Coder',
  },
  'react-weather': {
    id: 'react-weather',
    name: 'Weather Widget',
    description: 'React weather widget mockup.',
    category: 'react',
    subcategory: 'Dashboard',
    tags: ['react', 'weather', 'widget'],
    difficulty: 'beginner',
    features: ['Component architecture', 'Styling'],
    projectType: 'react',
    author: 'GB Coder',
  },
  'react-dashboard': {
    id: 'react-dashboard',
    name: 'React Admin Dashboard',
    description: 'React admin dashboard layout.',
    category: 'react',
    subcategory: 'Dashboard',
    tags: ['react', 'dashboard', 'layout'],
    difficulty: 'intermediate',
    features: ['Sidebar', 'Flexbox layout', 'Multiple components'],
    projectType: 'react',
    author: 'GB Coder',
  },
  'vue-tasks': {
    id: 'vue-tasks',
    name: 'Vue Task Manager',
    description: 'A simple Task manager in Vue 3.',
    category: 'vue',
    subcategory: 'Utility',
    tags: ['vue', 'task', 'manager'],
    difficulty: 'beginner',
    features: ['Composition API', 'v-for', 'v-model'],
    projectType: 'vue',
    author: 'GB Coder',
  },
  'nextjs-blog': {
    id: 'nextjs-blog',
    name: 'Next.js Blog Starter',
    description: 'A simulated Next.js Blog starter running on React client-side.',
    category: 'nextjs',
    subcategory: 'Blog',
    tags: ['nextjs', 'react', 'blog'],
    difficulty: 'intermediate',
    features: ['Next.js simulation', 'App router style structure'],
    projectType: 'react', // Uses React builder internally
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
          const { payload: _, ...meta } = t;
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
