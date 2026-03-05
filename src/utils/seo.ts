/**
 * SEO Configuration and Utilities for GB Coder
 * Optimized for Google and Bing search engines
 * Last Updated: 2025-03-05
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
  author: string;
}

export const defaultSEO: SEOConfig = {
  title: 'GB Coder – AI-Powered HTML, CSS & JavaScript Code Playground',
  description: 'Free AI-powered online code editor for HTML, CSS & JavaScript with live preview, intelligent code suggestions, and real-time debugging. No signup required. Start coding instantly in your browser!',
  keywords: [
    // Primary keywords
    'online code editor',
    'HTML editor',
    'CSS editor',
    'JavaScript editor',
    'AI code editor',
    'code playground',
    'online compiler',
    'web development tools',
    
    // Long-tail keywords
    'free online code editor',
    'HTML CSS JavaScript editor online',
    'AI-powered code editor',
    'online IDE for web development',
    'browser-based code editor',
    'live code preview editor',
    'Monaco editor online',
    'JavaScript compiler online',
    'frontend development tools',
    'web development IDE',
    
    // Feature-specific
    'code with AI assistance',
    'real-time code preview',
    'online code formatter',
    'external library manager',
    'code snippet manager',
    'debug JavaScript online',
    
    // Audience-specific
    'code editor for students',
    'learn web development online',
    'practice coding online',
    'prototype web projects',
    'test code snippets online'
  ],
  canonicalUrl: 'https://gbcoder.com/',
  ogImage: 'https://gbcoder.com/tghjkl.jpeg',
  author: 'Girish Lade'
};

/**
 * Generate structured data for SEO (JSON-LD)
 */
export const generateStructuredData = () => {
  const now = new Date().toISOString();
  
  return {
    // WebApplication Schema
    webApplication: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "GB Coder",
      "alternateName": ["GB Coder - AI Code Editor", "GB Coder Online IDE"],
      "url": "https://gbcoder.com",
      "logo": "https://gbcoder.com/favicon.ico",
      "image": "https://gbcoder.com/tghjkl.jpeg",
      "description": defaultSEO.description,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "browserRequirements": "Requires JavaScript",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/AvailableOnline"
      },
      "author": {
        "@type": "Person",
        "name": "Girish Lade",
        "url": "https://ladestack.in",
        "email": "girishlade111@gmail.com",
        "sameAs": [
          "https://www.instagram.com/girish_lade_/",
          "https://www.linkedin.com/in/girish-lade-075bba201/",
          "https://github.com/girishlade111",
          "https://codepen.io/Girish-Lade-the-looper"
        ]
      },
      "featureList": [
        "AI-powered code enhancement",
        "Live preview",
        "HTML, CSS, JavaScript editor",
        "External library manager",
        "Code history tracking",
        "Snippet management",
        "Integrated console",
        "Auto-save functionality",
        "No login required",
        "Free to use"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150",
        "bestRating": "5",
        "worstRating": "1"
      },
      "potentialAction": {
        "@type": "UseAction",
        "name": "Code with AI Assistance",
        "description": "Write and enhance code using AI-powered suggestions"
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Developers, Students, Web Designers"
      },
      "genre": "Web Development, Programming, Education",
      "keywords": defaultSEO.keywords.join(', '),
      "inLanguage": "en",
      "dateCreated": "2024",
      "dateModified": now
    },
    
    // Organization Schema
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "GB Coder",
      "url": "https://gbcoder.com",
      "logo": "https://gbcoder.com/favicon.ico",
      "description": "AI-powered online code editor for web developers",
      "founder": {
        "@type": "Person",
        "name": "Girish Lade"
      },
      "foundingDate": "2024",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "girishlade111@gmail.com",
        "contactType": "Customer Support",
        "availableLanguage": "English"
      },
      "sameAs": [
        "https://github.com/girishlade111/GB-Coder-Public-Beta",
        "https://ladestack.in"
      ]
    },
    
    // SoftwareApplication Schema (for enhanced rich snippets)
    softwareApplication: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "GB Coder",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150"
      },
      "featureList": "AI code suggestions, Live preview, External libraries, Auto-save",
      "screenshot": "https://gbcoder.com/tghjkl.jpeg",
      "downloadUrl": "https://gbcoder.com",
      "softwareVersion": "2.0.0",
      "author": {
        "@type": "Person",
        "name": "Girish Lade"
      }
    },
    
    // BreadcrumbList Schema
    breadcrumbList: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://gbcoder.com/"
        }
      ]
    }
  };
};

/**
 * Generate meta tags array for react-helmet or similar
 */
export const generateMetaTags = () => {
  return [
    // Basic Meta Tags
    { name: 'title', content: defaultSEO.title },
    { name: 'description', content: defaultSEO.description },
    { name: 'keywords', content: defaultSEO.keywords.join(', ') },
    { name: 'author', content: defaultSEO.author },
    { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
    { name: 'googlebot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
    { name: 'bingbot', content: 'index, follow' },
    
    // Language and Localization
    { name: 'language', content: 'English' },
    { name: 'revisit-after', content: '7 days' },
    { name: 'rating', content: 'general' },
    { name: 'distribution', content: 'global' },
    
    // Geographic
    { name: 'geo.region', content: 'IN-MH' },
    { name: 'geo.placename', content: 'Mumbai' },
    { name: 'geo.position', content: '19.0760;72.8777' },
    { name: 'ICBM', content: '19.0760, 72.8777' },
    
    // Open Graph / Facebook
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://gbcoder.com/' },
    { property: 'og:title', content: defaultSEO.title },
    { property: 'og:description', content: defaultSEO.description },
    { property: 'og:image', content: defaultSEO.ogImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'GB Coder - AI-Powered Code Editor Interface' },
    { property: 'og:site_name', content: 'GB Coder' },
    { property: 'og:locale', content: 'en_US' },
    
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: 'https://gbcoder.com/' },
    { name: 'twitter:title', content: defaultSEO.title },
    { name: 'twitter:description', content: defaultSEO.description },
    { name: 'twitter:image', content: defaultSEO.ogImage },
    { name: 'twitter:image:alt', content: 'GB Coder Code Editor Screenshot' },
    { name: 'twitter:creator', content: '@girish_lade_' },
    
    // Additional SEO
    { name: 'theme-color', content: '#3b82f6' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'GB Coder' },
    { name: 'application-name', content: 'GB Coder' },
    { name: 'msapplication-TileColor', content: '#3b82f6' },
    { name: 'msapplication-TileImage', content: '/favicon.ico' }
  ];
};

/**
 * Get page-specific SEO config
 */
export const getPageSEO = (page: string): Partial<SEOConfig> => {
  const pages: Record<string, Partial<SEOConfig>> = {
    about: {
      title: 'About GB Coder - AI-Powered Code Editor | Girish Lade',
      description: 'Learn about GB Coder, the AI-powered online code editor built by Girish Lade. Discover features, benefits, and how AI enhances your coding experience.'
    },
    documentation: {
      title: 'GB Coder Documentation - Complete Guide & Tutorials',
      description: 'Complete documentation for GB Coder. Learn how to use AI features, manage projects, add libraries, and maximize your productivity.'
    },
    history: {
      title: 'Code History - GB Coder',
      description: 'View and manage your code history in GB Coder. Track changes, revert to previous versions, and manage snapshots.'
    },
    privacy: {
      title: 'Privacy Policy - GB Coder',
      description: 'Privacy policy for GB Coder. Learn how we protect your data and ensure your coding privacy.'
    },
    terms: {
      title: 'Terms of Service - GB Coder',
      description: 'Terms of service for using GB Coder. Understand the rules and guidelines for our AI-powered code editor.'
    },
    contact: {
      title: 'Contact Us - GB Coder',
      description: 'Get in touch with the GB Coder team. Contact Girish Lade for support, feedback, or collaboration.'
    }
  };
  
  return pages[page] || {};
};

export default defaultSEO;
