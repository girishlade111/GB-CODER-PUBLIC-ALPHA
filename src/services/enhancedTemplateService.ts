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

// Phase 3 Enterprise Framework Templates (React, Vue, Next.js)
import reactSaasPlatform from './templates/react/saasPlatform';
import reactEcommerceStore from './templates/react/ecommerceStore';
import vueCloudDashboard from './templates/vue/cloudDashboard';
import vueAgencyPortfolio from './templates/vue/agencyPortfolio';
import nextjsAiStartup from './templates/nextjs/aiStartup';
import nextjsCrmPlatform from './templates/nextjs/crmPlatform';

// Phase 4 Enterprise Domain Templates
import landingOmniflow from './templates/landing/omniflow';
import dashboardAnalytics from './templates/dashboard/analytics';
import aiAgentStudio from './templates/ai-agents/agentStudio';
import portfolioArchitect from './templates/portfolio/architect';
import utilityDevpulse from './templates/utility/devpulse';
import saasTelemetry from './templates/saas/telemetry';
import startupFintech from './templates/startup/fintech';
import ecommerceBoutique from './templates/ecommerce/boutique';

// Phase 5 Enterprise Templates Batch A
import landingMobileApp from './templates/landing/mobileApp';
import dashboardCrypto from './templates/dashboard/cryptoTerminal';
import aiRagKnowledge from './templates/ai-agents/ragKnowledge';
import portfolioMotionDesigner from './templates/portfolio/motionDesigner';
import utilitySecurityAuditor from './templates/utility/securityAuditor';
import saasBillingEngine from './templates/saas/billingEngine';
import startupClimateTech from './templates/startup/climateTech';
import ecommerceSneakerDrop from './templates/ecommerce/sneakerDrop';
import businessLegalAdvisory from './templates/business/legalAdvisory';
import plainKanbanBoard from './templates/plain/kanbanBoard';

// Phase 5 Enterprise Templates Batch B
import aiAgentWorkflow from './templates/ai-agents/agentWorkflow';
import dashboardHealthcare from './templates/dashboard/healthcareOps';
import landingDevPlatform from './templates/landing/devPlatform';
import utilityMarkdownStudio from './templates/utility/markdownStudio';
import plainAudioSynth from './templates/plain/audioSynthesizer';
import ecommerceDigitalMarketplace from './templates/ecommerce/digitalMarketplace';
import startupHealthtech from './templates/startup/healthtechBio';
import portfolioPhotographer from './templates/portfolio/photographerVisual';
import saasCloudCost from './templates/saas/cloudCostFinops';
import businessArchitecture from './templates/business/architectureStudio';

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
  'react-saas-platform': reactSaasPlatform,
  'react-ecommerce-store': reactEcommerceStore,
  'vue-tasks': vueTasks,
  'vue-cloud-dashboard': vueCloudDashboard,
  'vue-agency-portfolio': vueAgencyPortfolio,
  'nextjs-blog': nextjsBlog,
  'nextjs-ai-startup': nextjsAiStartup,
  'nextjs-crm-platform': nextjsCrmPlatform,
  'business-agency': businessAgency,
  'business-consulting': businessConsulting,
  'business-local': businessLocal,
  'startup-waitlist': startupWaitlist,
  'saas-pricing': saasPricing,
  'landing-omniflow': landingOmniflow,
  'dashboard-analytics': dashboardAnalytics,
  'ai-agent-studio': aiAgentStudio,
  'portfolio-architect': portfolioArchitect,
  'utility-devpulse': utilityDevpulse,
  'saas-telemetry': saasTelemetry,
  'startup-fintech': startupFintech,
  'ecommerce-boutique': ecommerceBoutique,
  'landing-mobile-app': landingMobileApp,
  'dashboard-crypto': dashboardCrypto,
  'ai-rag-knowledge': aiRagKnowledge,
  'portfolio-motion-designer': portfolioMotionDesigner,
  'utility-audit-security': utilitySecurityAuditor,
  'saas-billing-engine': saasBillingEngine,
  'startup-climate-tech': startupClimateTech,
  'ecommerce-sneaker-drop': ecommerceSneakerDrop,
  'business-law-firm': businessLegalAdvisory,
  'plain-kanban': plainKanbanBoard,
  'ai-agent-workflow': aiAgentWorkflow,
  'dashboard-healthcare': dashboardHealthcare,
  'landing-dev-platform': landingDevPlatform,
  'utility-doc-studio': utilityMarkdownStudio,
  'plain-audio-synth': plainAudioSynth,
  'ecommerce-digital-marketplace': ecommerceDigitalMarketplace,
  'startup-healthtech': startupHealthtech,
  'portfolio-photographer': portfolioPhotographer,
  'saas-cloudcost': saasCloudCost,
  'business-architecture': businessArchitecture,
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
  'react-saas-platform': {
    id: 'react-saas-platform',
    name: 'Nexus AI Enterprise Platform',
    description: 'Enterprise AI orchestration & workspace: interactive prompt playground, model switcher, live KPI cards with SVG sparklines, workflow pipelines, and audit log.',
    category: 'react',
    subcategory: 'SaaS',
    tags: ['react', 'saas', 'ai', 'dashboard', 'enterprise', 'dark-mode'],
    difficulty: 'advanced',
    features: ['Collapsible sidebar with cluster switcher', 'Interactive AI prompt playground with simulated streaming & model switcher', '4 KPI cards with SVG sparklines & trend delta', 'Workflow pipeline kanban with stage transitions & tags', 'Interactive SVG analytics chart with dual datasets & hover tooltips', 'Real-time activity audit log with severity filtering', 'Team members & role-based access control modal', 'Dark mode glassmorphism with subtle glows'],
    projectType: 'react',
    author: 'GB Coder',
  },
  'react-ecommerce-store': {
    id: 'react-ecommerce-store',
    name: 'Aura Luxury Tech Storefront',
    description: 'Ultra-premium lifestyle & hardware storefront: 3D-styled hero showcase, category filters, interactive slide-over cart drawer with promo codes, product modal, and rating breakdown.',
    category: 'react',
    subcategory: 'E-commerce',
    tags: ['react', 'ecommerce', 'store', 'cart', 'luxury', 'hardware'],
    difficulty: 'advanced',
    features: ['Floating glassmorphic navigation with live cart count & currency selector', 'Hero spotlight with dynamic device render & feature callouts', '8 premium tech products with category filtering & instant search', 'Interactive slide-over cart drawer with quantity steppers & free shipping meter', 'Validating promo code system (AURA20)', 'Product quick-view modal with specs table, color swatches & stock badge', 'Customer reviews section with star distribution & verified buyer tags'],
    projectType: 'react',
    author: 'GB Coder',
  },
  'vue-cloud-dashboard': {
    id: 'vue-cloud-dashboard',
    name: 'CloudPulse DevOps Console',
    description: 'Enterprise serverless & container monitoring dashboard built with Vue 3 Composition API: real-time server health matrix, live SVG metric gauges, CI/CD pipeline visualizer, and log stream viewer.',
    category: 'vue',
    subcategory: 'DevOps',
    tags: ['vue', 'cloud', 'devops', 'monitoring', 'charts', 'infrastructure'],
    difficulty: 'advanced',
    features: ['Vue 3 script setup with reactive composables', 'Cluster health status matrix with animated pulse indicators', 'Interactive SVG radial gauges for CPU, Memory, Disk, and Network', 'Interactive deployment pipeline tracker with stage durations & logs', 'Live terminal log stream with auto-scroll, severity filter & search', 'Multi-region cluster switcher (US-East, EU-Central, AP-East)', 'Worker node fleet management with cordon & drain actions'],
    projectType: 'vue',
    author: 'GB Coder',
  },
  'vue-agency-portfolio': {
    id: 'vue-agency-portfolio',
    name: 'Vanguard Creative Studio',
    description: 'Avant-garde design studio site built with Vue 3: kinetic typography hero, interactive case study grid with hover reveals, live project budget estimator, and consultation modal.',
    category: 'vue',
    subcategory: 'Portfolio',
    tags: ['vue', 'portfolio', 'agency', 'creative', 'animation', 'minimal'],
    difficulty: 'advanced',
    features: ['Kinetic typography entrance reveal with glowing gradient mesh', 'Filterable case study showcase (Design Systems, 3D/Motion, Web Platforms, AI Tools)', 'Interactive project budget & scope calculator with real-time price estimation', 'Accordion-based interactive capabilities & deliverables list', 'Dynamic client logo marquee with continuous smooth ticker animation', 'Validated inquiry / consultation booking modal with budget selector'],
    projectType: 'vue',
    author: 'GB Coder',
  },
  'nextjs-ai-startup': {
    id: 'nextjs-ai-startup',
    name: 'Synapse AI Platform & Docs',
    description: 'App-Router-architected Next.js AI platform: interactive model playground with streaming replies, full documentation portal with code tabs, interactive pricing matrix, and terminal hero.',
    category: 'nextjs',
    subcategory: 'AI Platform',
    tags: ['nextjs', 'react', 'ai', 'docs', 'app-router', 'saas'],
    difficulty: 'advanced',
    features: ['Next.js 14 App Router layout & page structure simulation', 'Client-side routing across /, /playground, /pricing, and /docs', 'Glowing aurora hero with interactive terminal typing effect', 'Live AI Model Playground with temperature, prompt templates & streaming responses', 'Interactive pricing matrix with monthly/yearly billing & volume discount slider', 'Full Documentation center with categorized sidebar, search filter, and copyable API code', 'Feature comparison table with enterprise security & compliance details'],
    projectType: 'react', // App Router conventions emulated client-side
    author: 'GB Coder',
  },
  'nextjs-crm-platform': {
    id: 'nextjs-crm-platform',
    name: 'Relate Enterprise CRM',
    description: 'Full Next.js App Router CRM suite: multi-stage sales pipeline kanban with stage advancement, searchable customer directory, revenue forecasting charts, and deal management.',
    category: 'nextjs',
    subcategory: 'CRM & Sales',
    tags: ['nextjs', 'react', 'crm', 'sales', 'kanban', 'app-router'],
    difficulty: 'advanced',
    features: ['App Router nested layouts with persistent command sidebar', 'Route navigation: /dashboard, /pipeline, /customers, /analytics', 'Multi-stage Sales Pipeline Kanban with click stage advancement & total deal value', 'Customer & Account directory with instant search, status pills, and sorting', 'Revenue forecasting charts with quarterly target progress indicators', 'Enterprise aesthetic: tabular data typography, crisp badges, micro-interactions'],
    projectType: 'react', // App Router conventions emulated client-side
    author: 'GB Coder',
  },
  'landing-omniflow': {
    id: 'landing-omniflow',
    name: 'OmniFlow Cloud Platform',
    description: 'High-converting enterprise infrastructure landing page: animated gradient-glow hero, dynamic tabbed interactive platform previewer, annual pricing discount calculator, and FAQ accordion.',
    category: 'landing',
    subcategory: 'Cloud Infrastructure',
    tags: ['landing', 'b2b', 'saas', 'cloud', 'animation', 'pricing'],
    difficulty: 'intermediate',
    features: ['Interactive pipeline preview canvas with dynamic tab switcher', 'Annual billing toggle with 20% savings calculator', 'Animated metric stat cards with real-time counters', 'Interactive FAQ accordion with smooth open/close', 'Newsletter lead capture with live feedback', 'Responsive navigation with mobile toggle'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'dashboard-analytics': {
    id: 'dashboard-analytics',
    name: 'Apex Operations & Analytics Console',
    description: 'Mission-control operations dashboard: interactive SVG time-series charts, regional edge mesh status meters, searchable microservices table, and live streaming audit log.',
    category: 'dashboard',
    subcategory: 'Operations',
    tags: ['dashboard', 'analytics', 'charts', 'telemetry', 'operations', 'admin'],
    difficulty: 'advanced',
    features: ['SVG time-series ingress volume chart with dual line curves', 'Regional edge latency health indicators with animated bars', 'Searchable services table with instant filter and restart actions', 'Live automated audit log stream with pause/resume and level filters', 'KPI metric cards with delta comparison pills', 'Time range selector (1H, 24H, 7D, 30D)'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'ai-agent-studio': {
    id: 'ai-agent-studio',
    name: 'Cognition Agent Studio',
    description: 'Autonomous multi-agent orchestration canvas: multi-agent fleet status cards, visual execution pipeline DAG, live chain-of-thought streaming, and hyperparameter controls.',
    category: 'ai-agents',
    subcategory: 'Multi-Agent',
    tags: ['ai', 'agents', 'workflow', 'orchestration', 'llm', 'studio'],
    difficulty: 'advanced',
    features: ['Multi-agent fleet selector (Architect, Researcher, Coder, Auditor)', 'Interactive Pipeline DAG with status indicators', 'Live chain-of-thought reasoning stream & artifact viewer', 'Real-time hyperparameter sliders (Temperature, Autonomous Loops)', 'Pre-configured scenario selector for instant demos', 'Client-side isolated simulation mode'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'portfolio-architect': {
    id: 'portfolio-architect',
    name: 'Aether Principal Architect',
    description: 'Minimalist staff architect portfolio: kinetic typography hero, filterable architecture case studies, interactive case study modal with architecture diagrams, and interactive contact terminal.',
    category: 'portfolio',
    subcategory: 'Staff Engineer',
    tags: ['portfolio', 'architect', 'minimal', 'terminal', 'dark-mode', 'case-study'],
    difficulty: 'intermediate',
    features: ['Kinetic typography headline with serif accent highlights', 'Filterable case studies (Distributed Systems, AI Infrastructure, Fintech)', 'Interactive modal popup with problem, solution, and outcome metrics', 'Interactive command-line contact terminal with instant feedback', 'One-click copy email button with clipboard integration', 'Availability badge for advisory / consulting'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'utility-devpulse': {
    id: 'utility-devpulse',
    name: 'DevPulse Universal Developer Toolbox',
    description: 'Complete client-side developer toolbox: JWT token decoder with claim inspector, live Regex studio with group highlighter, JSON formatter/minifier, UUID/NanoID generator, and Base64 encoder.',
    category: 'utility',
    subcategory: 'Developer Tools',
    tags: ['utility', 'tools', 'jwt', 'regex', 'json', 'uuid', 'base64'],
    difficulty: 'intermediate',
    features: ['JWT Inspector with live decoded header & payload claims', 'Regex Studio with live match count and real-time color highlighting', 'JSON Formatter with 2-space beautification and minification', 'Cryptographic UUIDv4, NanoID, and 256-bit API key generator', 'Base64 and URL encoder/decoder with one-click copy', '100% Client-side execution with zero external data leaks'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'saas-telemetry': {
    id: 'saas-telemetry',
    name: 'PulseGuard APM Telemetry',
    description: 'High-performance cloud APM & incident triage suite: 24-node Kubernetes cluster heatmap, live P1 incident simulator with auto-remediation, latency charts, and PromQL query console.',
    category: 'saas',
    subcategory: 'APM & Observability',
    tags: ['saas', 'apm', 'telemetry', 'kubernetes', 'monitoring', 'incident-ops'],
    difficulty: 'advanced',
    features: ['Interactive 24-node Kubernetes cluster heatmap with CPU load meters', 'Live P1 Outage Simulator with visual degradation and on-call pager', 'One-click automated remediation (cordon & drain pods)', 'PromQL query execution bar with sample metrics', 'Dual-line p95 and p99 latency SVG charts', 'Cluster health summary indicators'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'startup-fintech': {
    id: 'startup-fintech',
    name: 'Starlight Global Fintech',
    description: 'YC-grade programmable payment infrastructure startup site: customizable 3D-feel corporate virtual cards, dynamic interchange ROI calculator slider, and multi-language API playground.',
    category: 'startup',
    subcategory: 'Fintech Rails',
    tags: ['startup', 'fintech', 'payments', 'cards', 'api', 'calculator'],
    difficulty: 'advanced',
    features: ['Interactive virtual charge card visualizer with Obsidian/Titanium/Cyber skins', 'Card reveal, freeze, and issue-new simulation buttons', 'Annual processing volume slider with dynamic interchange savings ROI', 'Interactive API Playground (cURL, Node.js, Python) with sandbox runner', 'Live payment execution status simulator', 'Global payment metrics and network indicators'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'ecommerce-boutique': {
    id: 'ecommerce-boutique',
    name: 'Luminary Luxury Atelier',
    description: 'Minimalist high-end electronics & lifestyle marketplace: category filters, interactive sliding cart drawer, free shipping milestone progress bar, wishlist toggles, and promo code discounts.',
    category: 'ecommerce',
    subcategory: 'Luxury Lifestyle',
    tags: ['ecommerce', 'store', 'luxury', 'cart', 'drawer', 'checkout'],
    difficulty: 'advanced',
    features: ['Category filter pills (Acoustics, Precision Input, Lighting)', 'Interactive slide-out Cart Drawer with real-time price calculations', 'Dynamic free shipping milestone tracker with animated progress bar', 'Promo code discount engine (LUMINARY15 for 15% off)', 'Wishlist heart toggle with active item count badge', 'Simulated 1-click Apple Pay & Stripe checkout flow'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'landing-mobile-app': {
    id: 'landing-mobile-app',
    name: 'Aura Vision Spatial App',
    description: 'Ultra-modern spatial computing and mobile app showcase: interactive 3D perspective phone mockup, device screen tab switcher, animated feature highlights, and interactive customer review slider.',
    category: 'landing',
    subcategory: 'Mobile & Spatial',
    tags: ['landing', 'mobile', 'app', 'spatial', 'ios', 'glassmorphism', 'showcase'],
    difficulty: 'intermediate',
    features: ['3D CSS perspective phone chassis with realistic camera notch and dynamic glass glare', 'Interactive screen switcher tab (Spatial, Neural, Sync) live preview inside phone', 'Feature showcase cards with hover glow and animated badge indicators', 'Customer quote carousel with active indicator dots', 'Store download buttons with hover lift effects', 'Zero external CDN dependencies'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'dashboard-crypto': {
    id: 'dashboard-crypto',
    name: 'Vertex Capital Trading Terminal',
    description: 'Wall Street institutional crypto & derivatives execution console: high-frequency real-time order book, interactive multi-timeframe candlestick chart, market depth ladder, and fast trade execution slip.',
    category: 'dashboard',
    subcategory: 'Fintech & Trading',
    tags: ['dashboard', 'crypto', 'trading', 'orderbook', 'candlestick', 'terminal'],
    difficulty: 'advanced',
    features: ['Live animated Order Book ladder with bid/ask depth spread bars', 'HTML5 Canvas dynamic Candlestick Chart with interactive Crosshair and timeframe selector (1m, 15m, 1h, 1D)', 'Real-time trade tape tick generator with green/red execution alerts', 'Interactive Market & Limit order entry form with leverage slider (1x - 100x)', 'Floating PnL and active open positions table with live tick updates', 'High-contrast Bloomberg-style dark mode terminal aesthetic'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'ai-rag-knowledge': {
    id: 'ai-rag-knowledge',
    name: 'VectorMind Neural Search Hub',
    description: 'Enterprise RAG knowledge base & semantic search cockpit: document chunking visualizer, cosine similarity relevance scores, vector embedding dimension inspector, and interactive query retrieval runner.',
    category: 'ai-agents',
    subcategory: 'RAG & Vector Search',
    tags: ['ai-agents', 'rag', 'vector', 'search', 'embeddings', 'knowledge-base'],
    difficulty: 'advanced',
    features: ['Semantic Vector Search simulator with live query embedding generation', 'Cosine similarity match ranking cards with relevance percentage gauges', 'Document chunking inspector showing raw text tokens and vector IDs', 'Interactive chunk inspector modal with metadata properties', 'Vector index telemetry (HNSW index graph, dimension count, p99 latency)', 'Sample queries to immediately test semantic query matching'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'portfolio-motion-designer': {
    id: 'portfolio-motion-designer',
    name: 'Kroma 3D Motion Designer',
    description: 'High-octane creative director & 3D motion artist portfolio: dark editorial typography, interactive WebGL canvas particle sphere with cursor physics, video showreel hero modal, and magnetic project showcase cards.',
    category: 'portfolio',
    subcategory: 'Motion & 3D',
    tags: ['portfolio', 'motion', '3d', 'creative', 'interactive', 'canvas', 'director'],
    difficulty: 'advanced',
    features: ['Real-time interactive HTML5 Canvas 3D particle sphere reacting to cursor physics', 'Editorial marquee ticker with variable bold typography', 'Magnetic project case study cards with expanding image overlays', 'Interactive Showreel modal player with simulated cinematic preview', 'Client credits grid (Nike, Apple, Sony, Balenciaga)', 'Interactive contact inquiry sheet with budget range selector'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'utility-audit-security': {
    id: 'utility-audit-security',
    name: 'CyberShield Security & SSL Inspector',
    description: 'Enterprise security posture and SSL/TLS inspector: domain header security analyzer (CSP, HSTS, X-Frame), cryptographic password entropy auditor with breach estimator, and SSL certificate expiration warning tracker.',
    category: 'utility',
    subcategory: 'DevSecOps & Privacy',
    tags: ['utility', 'security', 'ssl', 'audit', 'headers', 'entropy', 'devsecops'],
    difficulty: 'intermediate',
    features: ['Interactive Domain Security Header Auditor (analyzes CSP, HSTS, X-Content-Type-Options)', 'Real-time Password Entropy and Brute-Force Time calculation engine', 'Cryptographic SHA-256 and HMAC-SHA256 live generator', 'SSL/TLS Certificate health scorecard with expiry warning alerts', 'Port scanner simulator with vulnerability severity tagging', '100% Client-side sandbox execution with zero network exposure'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'saas-billing-engine': {
    id: 'saas-billing-engine',
    name: 'StripeScale Subscription & RevOps',
    description: 'Modern B2B SaaS revenue operations and subscription billing console: MRR/ARR waterfall metrics, interactive tier upgrade simulator with prorated invoices, dunning churn manager, and webhook events feed.',
    category: 'saas',
    subcategory: 'Billing & RevOps',
    tags: ['saas', 'billing', 'stripe', 'subscriptions', 'revops', 'invoicing'],
    difficulty: 'advanced',
    features: ['Interactive Subscription Plan Builder (Starter, Growth, Enterprise) with monthly/annual toggle', 'Proration and invoice preview calculator updating in real time', 'MRR / ARR / Net Retention revenue summary metric widgets', 'Live Webhook Event Stream simulator (invoice.paid, customer.subscription.updated)', 'Failed payment recovery & dunning workflow toggle', 'Exportable PDF invoice simulation with line items'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'startup-climate-tech': {
    id: 'startup-climate-tech',
    name: 'TerraCarbon ESG & Carbon Accounting',
    description: 'Enterprise carbon footprint accounting & climate intelligence platform: live Scope 1/2/3 emissions calculator, carbon offset marketplace, supply chain ESG audit scorecards, and net-zero milestone roadmap.',
    category: 'startup',
    subcategory: 'ClimateTech & ESG',
    tags: ['startup', 'climatetech', 'esg', 'carbon', 'calculator', 'sustainability'],
    difficulty: 'advanced',
    features: ['Interactive Scope 1, 2, and 3 Corporate Emissions Calculator with instant CO2e breakdown', 'Interactive Carbon Offset project marketplace with unit price calculation', 'Supply chain ESG scorecard with sector benchmark indicators', 'Interactive Net-Zero Trajectory chart with milestone toggles', 'Certified registry verification badge and audit log export', 'Eco-friendly dark green and forest glassmorphism design'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'ecommerce-sneaker-drop': {
    id: 'ecommerce-sneaker-drop',
    name: 'KicksVault Limited Launchpad',
    description: 'Hypebeast limited-edition streetwear & sneaker drop launchpad: live countdown timer to drop zero, interactive 360-degree colorway picker, size grid selector with live stock indicators, and simulated raffle entry.',
    category: 'ecommerce',
    subcategory: 'Drops & Streetwear',
    tags: ['ecommerce', 'drops', 'sneakers', 'streetwear', 'countdown', 'raffle'],
    difficulty: 'intermediate',
    features: ['Live Millisecond Countdown Clock to the next hype release drop', 'Interactive Colorway Switcher dynamically updating sneaker visuals and accent lighting', 'Shoe Size selection grid with real-time "Low Stock" and "Sold Out" states', 'Raffle Draw Ticket reservation modal with simulated ticket confirmation', 'Drop alert SMS/Email notification signup form with instant validation', 'Cyberpunk / Streetwear bold dark aesthetic with neon accents'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'business-law-firm': {
    id: 'business-law-firm',
    name: 'Vanguard & Sterling Global Counsel',
    description: 'High-end corporate law firm and cross-border M&A advisory site: distinguished navy and gold aesthetic, practice area accordions, partner attorney directory, case settlement tracker, and confidential case evaluation booking.',
    category: 'business',
    subcategory: 'Legal Advisory',
    tags: ['business', 'legal', 'law-firm', 'attorney', 'corporate', 'advisory'],
    difficulty: 'intermediate',
    features: ['Distinguished luxury navy and metallic gold design system', 'Interactive Practice Area selector (M&A, Intellectual Property, Securities, Antitrust)', 'Partner Attorney profiles with practice focus, education, and direct vCard links', 'Notable Case Settlements & Landmark Precedents ticker counter', 'Confidential Attorney-Client Privileged consultation request modal', 'Client testimonials and prestigious legal rankings (Chambers, Legal 500)'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'plain-kanban': {
    id: 'plain-kanban',
    name: 'FlowState Zero-Dependency Kanban',
    description: 'Production-ready, zero-dependency Kanban task management board: HTML5 drag-and-drop between columns, task creation with priority badges, column WIP limits, localStorage persistence, and live search filtering.',
    category: 'plain',
    subcategory: 'Productivity Apps',
    tags: ['plain', 'kanban', 'productivity', 'drag-and-drop', 'localstorage', 'task-manager'],
    difficulty: 'intermediate',
    features: ['Native HTML5 Drag and Drop across Backlog, In Progress, Review, and Done columns', 'Task creation modal with title, description, priority (Urgent/Medium/Low), and due dates', 'Live search and filter bar dynamically highlighting matching cards', 'Column Work-In-Progress (WIP) limit warnings when thresholds are exceeded', 'Automatic browser localStorage persistence so tasks survive refresh', 'Clean, modern Notion/Linear-inspired minimalist UI with dark mode support'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'ai-agent-workflow': {
    id: 'ai-agent-workflow',
    name: 'Synapse Autonomous Workflow Orchestrator',
    description: 'Autonomous multi-agent DAG execution pipeline: visual node graph (Ingest -> LLM Intent -> RAG Policy -> Stripe API -> Action), step-by-step glowing execution runner, live agent logs stream, and token meter.',
    category: 'ai-agents',
    subcategory: 'Multi-Agent DAG',
    tags: ['ai-agents', 'workflow', 'orchestrator', 'dag', 'llm', 'agents', 'pipeline'],
    difficulty: 'advanced',
    features: ['Interactive 5-node directed acyclic graph (DAG) with animated connection wires', 'Step-by-step live pipeline execution with dynamic progress bar', 'Real-time agent terminal stream with typewriter effect and timestamped audit logs', 'Interactive node inspector displaying system prompts, model parameters, and roles', 'Live token consumption meter and execution cost tracker', 'Pipeline reset and re-run simulations'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'dashboard-healthcare': {
    id: 'dashboard-healthcare',
    name: 'Vitalis Healthcare & ICU Telemetry Center',
    description: 'Level 1 Trauma ICU central telemetry command center: real-time HTML5 Canvas ECG lead II heartbeat monitor, 12-bed ICU acuity matrix, emergency department triage queue, and code blue simulator.',
    category: 'dashboard',
    subcategory: 'Healthcare & Clinical',
    tags: ['dashboard', 'healthcare', 'hospital', 'telemetry', 'ecg', 'vitals', 'icu'],
    difficulty: 'advanced',
    features: ['HTML5 Canvas live ECG monitor with P-Q-R-S-T cardiac waveform rendering', 'Interactive ICU Bed Acuity Matrix with selectable patient telemetry switching', 'Live Vital Signs indicators (Heart Rate, SpO2, NIBP blood pressure, Respiration, Temp)', 'Code Blue emergency alert banner with simulated ventricular fibrillation waveform', 'Emergency Department Triage priority queue with ESI acuity ratings', 'On-call clinical staff pager dispatch simulator'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'landing-dev-platform': {
    id: 'landing-dev-platform',
    name: 'HyperEdge Serverless Cloud Platform',
    description: 'High-performance global edge cloud platform landing page: real-time global ping benchmark across 6 international edge nodes, interactive CLI deployment terminal, and dynamic bandwidth ROI slider.',
    category: 'landing',
    subcategory: 'Cloud & Infrastructure',
    tags: ['landing', 'dev-platform', 'serverless', 'edge', 'benchmark', 'terminal', 'cloud'],
    difficulty: 'intermediate',
    features: ['Real-time global edge node ping benchmark (Tokyo, Frankfurt, SFO, London, Singapore, Sydney)', 'Interactive CLI terminal deployment simulation with multi-step build output', 'One-click npx install command clipboard copy with visual confirmation', 'Interactive bandwidth and function invocations pricing calculator vs AWS', 'Modern dark cyber-infrastructure visual aesthetic with glow gradients', 'Zero external CDN dependencies'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'utility-doc-studio': {
    id: 'utility-doc-studio',
    name: 'OmniDoc Enterprise Markdown Studio',
    description: 'Split-pane technical documentation and Markdown authoring studio: live GitHub-flavored Markdown preview, real-time word and reading-time counter, automatic table of contents generator, and dark/light theme toggle.',
    category: 'utility',
    subcategory: 'Documentation Tools',
    tags: ['utility', 'markdown', 'editor', 'docs', 'preview', 'wordcount', 'toc'],
    difficulty: 'intermediate',
    features: ['Synchronized dual-pane Markdown source editor and live rendered HTML preview', 'Live word count, character count, and estimated reading time statistics', 'Automatic Table of Contents (TOC) generator dynamically parsed from headings', 'Formatting toolbar for bold, italic, code blocks, tables, blockquotes, and links', 'Export to HTML (one-click copy) and download document as .md file', 'Dark and light documentation theme switcher'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'plain-audio-synth': {
    id: 'plain-audio-synth',
    name: 'Pulse808 Web Audio Beat Machine',
    description: 'Analog drum machine and bass synthesizer powered by the browser Web Audio API: 16-step sequencer matrix, synthesized kick/snare/hi-hat/acid bass (zero audio samples needed!), BPM tempo slider, and presets.',
    category: 'plain',
    subcategory: 'Audio & Music Apps',
    tags: ['plain', 'audio', 'synth', 'drum-machine', 'sequencer', 'web-audio', '808'],
    difficulty: 'advanced',
    features: ['100% Native Web Audio API synthesis (sine decay kick, filtered noise snare, acid bass)', '16-step sequencer matrix across 4 sound channels with active LED step runner', 'BPM tempo slider (70 - 175 BPM) with real-time transport play/stop controls', 'Pattern presets for House, Trap, and Electro beats', 'Master analog low-pass resonance cutoff filter with real-time dials', 'Dynamic stereo LED VU output level meters'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'ecommerce-digital-marketplace': {
    id: 'ecommerce-digital-marketplace',
    name: 'SoundVault Creator Audio Marketplace',
    description: 'Lossless royalty-free audio sample packs and creator stems store: sticky audio waveform scrubber with live playhead, genre filtering (Synthwave, Cinematic, Trap, Lo-Fi), and slide-out cart drawer.',
    category: 'ecommerce',
    subcategory: 'Digital Products',
    tags: ['ecommerce', 'audio', 'marketplace', 'waveform', 'cart', 'samples', 'stems'],
    difficulty: 'advanced',
    features: ['Interactive HTML5 Canvas audio waveform scrubber with play/pause and progress scrubbing', 'Sticky audio player bar tracking current playing pack across the marketplace', 'Genre filter pills (Synthwave, Cinematic Stems, Drill & Trap 808, Lo-Fi & Ambient)', 'Slide-out Cart Drawer with item removal and instant subtotal calculation', 'Instant live search filtering packs by keyword, instrument, and genre', 'Commercial royalty-free license indicators and checkout simulator'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'startup-healthtech': {
    id: 'startup-healthtech',
    name: 'HelixBio AI Precision Therapeutics',
    description: 'Series B deeptech biotechnology startup site: interactive 3D-feel DNA double-helix Canvas animation, clinical trial pipeline phase tracker (Discovery through Phase III), and genomic biomarker pocket selector.',
    category: 'startup',
    subcategory: 'Biotech & HealthTech',
    tags: ['startup', 'biotech', 'healthtech', 'dna', 'clinical-trials', 'oncology', 'canvas'],
    difficulty: 'advanced',
    features: ['Real-time 60 FPS HTML5 Canvas DNA double-helix animation with rotation speed controls', 'Simulated molecular ligand docking animation with glowing binding complex', 'Clinical Trial Pipeline roadmap tracker across Discovery, Preclinical, Phase I, Phase II', 'Genomic Biomarker target explorer (KRAS-G12D, EGFR-Ex20, BRAF-V600E) with binding affinities', 'Confidential Investor Data Room request modal with validation', 'Deeptech dark blue glassmorphism design system'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'portfolio-photographer': {
    id: 'portfolio-photographer',
    name: 'Lumina Lens Fine Art Gallery',
    description: 'Minimalist darkroom fine art & editorial photography portfolio: responsive masonry gallery, full-screen lightbox with real camera EXIF metadata display (Leica M11, shutter, aperture, ISO), and print ordering calculator.',
    category: 'portfolio',
    subcategory: 'Photography & Art',
    tags: ['portfolio', 'photography', 'gallery', 'exif', 'lightbox', 'fine-art', 'editorial'],
    difficulty: 'intermediate',
    features: ['Darkroom minimalist gallery with smooth hover reveals and metadata overlays', 'Interactive full-screen Lightbox displaying comprehensive EXIF camera metadata', 'Collection filter buttons (All Works, Monochrome, Tokyo Neon, Architectural)', 'Fine Art Print ordering modal with paper selection and custom framing price calculator', 'Client project booking inquiry flow', 'High-end European editorial typography and minimalist palette'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'saas-cloudcost': {
    id: 'saas-cloudcost',
    name: 'CloudPrism Multi-Cloud FinOps Hub',
    description: 'Enterprise cloud spend observability and automated cost pruning platform: multi-cloud spend donut chart (AWS, GCP, Azure), zombie resource detector with one-click terminate simulation, and anomaly alerts.',
    category: 'saas',
    subcategory: 'FinOps & Cloud Cost',
    tags: ['saas', 'finops', 'cloud', 'aws', 'gcp', 'azure', 'cost-optimization'],
    difficulty: 'advanced',
    features: ['Multi-cloud spend allocation SVG donut chart with interactive provider breakdown', 'Zombie Resource Detector tracking unattached EBS volumes, idle GPUs, and abandoned ALBs', 'One-click resource termination simulation dynamically reducing monthly waste total', 'Real-time cost anomaly spike tracker with severity indicators', 'Committed use and reserved instance coverage indicators', 'Exportable executive FinOps summary report generator'],
    projectType: 'plain',
    author: 'GB Coder',
  },
  'business-architecture': {
    id: 'business-architecture',
    name: 'Atelier Forma Luxury Architecture',
    description: 'Contemporary European architectural atelier and spatial design studio site: interactive Before/After renovation comparison slider, tactile materiality board (Travertine, Oak, Bronze), and private consultation scheduler.',
    category: 'business',
    subcategory: 'Architecture & Design',
    tags: ['business', 'architecture', 'interior', 'luxury', 'before-after', 'slider', 'materials'],
    difficulty: 'intermediate',
    features: ['Interactive Before/After renovation comparison slider with mouse and touch dragging', 'Tactile Materiality Curation board showcasing natural textures, quarries, and finishes', 'Architectural monograph showcase with alpine and urban residential villa spotlights', 'Key studio metrics (Built Residencies, RIBA Gold Medal, Passive Solar Mass)', 'Private client consultation scheduling modal with budget and scope selector', 'Swiss/Milanese high-end architectural layout and typography'],
    projectType: 'plain',
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
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
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
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
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
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
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
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
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
