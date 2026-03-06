// Enhanced Code Templates Service with Lazy Loading
// Templates load on-demand for better performance

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  subcategory?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  features?: string[];
}

export type TemplateCategory = 
  | 'business' | 'ai-agents' | 'startup' | 'saas' | 'ecommerce' 
  | 'portfolio' | 'landing' | 'dashboard' | 'utility';

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
];

// Import actual templates
import businessCorporate from './templates/business/corporate';
import aiChatbot from './templates/ai-agents/chatbot';
import startupLanding from './templates/startup/landing';
import saasDashboard from './templates/saas/dashboard';
import ecommerceStore from './templates/ecommerce/store';
import portfolioDeveloper from './templates/portfolio/developer';
import utilityCalculator from './templates/utility/calculator';

// Template registry with actual code
const templateRegistry: Record<string, { html: string; css: string; javascript: string }> = {
  'business-corporate': businessCorporate,
  'ai-chatbot': aiChatbot,
  'startup-landing': startupLanding,
  'saas-dashboard': saasDashboard,
  'ecommerce-store': ecommerceStore,
  'portfolio-developer': portfolioDeveloper,
  'utility-calculator': utilityCalculator,
};

// Template metadata
const templateMetadata: Record<string, CodeTemplate> = {
  'business-corporate': {
    id: 'business-corporate',
    name: 'Corporate Business',
    description: 'Professional corporate website with modern design',
    category: 'business',
    subcategory: 'Corporate',
    tags: ['business', 'corporate', 'professional', 'responsive'],
    difficulty: 'intermediate',
    features: ['Hero Section', 'Services', 'Team', 'Contact Form', 'About Us'],
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
  },
};

class EnhancedTemplateService {
  private static instance: EnhancedTemplateService;

  private constructor() {}

  public static getInstance(): EnhancedTemplateService {
    if (!EnhancedTemplateService.instance) {
      EnhancedTemplateService.instance = new EnhancedTemplateService();
    }
    return EnhancedTemplateService.instance;
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
  public async getTemplateById(id: string): Promise<{ html: string; css: string; javascript: string } | null> {
    try {
      const templateCode = templateRegistry[id];
      if (!templateCode) {
        console.error(`Template not found: ${id}`);
        return null;
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
