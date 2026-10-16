import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  type SupportedLanguage,
  isValidLanguage,
} from './languages';

export const SITE_ORIGIN = 'https://code.ladestack.in';

/**
 * Generates the clean pathname for a given language and base route.
 * English is always at the root (/features, /docs, /blog),
 * other languages have the prefix (/{lang}/features, etc.).
 */
export function getLocalizedPath(lang: string, basePath: string = ''): string {
  const cleanBase = basePath.replace(/^\/+|\/+$/g, '');
  if (lang === DEFAULT_LANGUAGE || !lang) {
    return cleanBase ? `/${cleanBase}` : '/';
  }
  return cleanBase ? `/${lang}/${cleanBase}` : `/${lang}`;
}

/**
 * Returns the absolute canonical URL for a language and base route.
 */
export function getCanonicalUrl(lang: string, basePath: string = ''): string {
  const localizedPath = getLocalizedPath(lang, basePath);
  return `${SITE_ORIGIN}${localizedPath}`;
}

export interface AlternateLink {
  hreflang: string;
  href: string;
}

/**
 * Returns reciprocal alternate hreflang links for all supported languages plus x-default.
 */
export function getAlternateLinks(basePath: string = ''): AlternateLink[] {
  const alternates: AlternateLink[] = [];

  // All 9 supported languages
  for (const [code] of Object.entries(SUPPORTED_LANGUAGES)) {
    alternates.push({
      hreflang: code,
      href: getCanonicalUrl(code, basePath),
    });
  }

  // x-default points to the English root default
  alternates.push({
    hreflang: 'x-default',
    href: getCanonicalUrl(DEFAULT_LANGUAGE, basePath),
  });

  return alternates;
}

/**
 * Calculates estimated reading time from text content.
 * Accounts for CJK characters (approx 350-500 chars/min) vs alphabetic words (approx 200 words/min).
 */
export function calculateReadingTime(content: string, lang: string = 'en'): number {
  if (lang === 'ja' || lang === 'zh' || lang === 'ko') {
    // Character count for CJK
    const charCount = content.replace(/\s+/g, '').length;
    return Math.max(1, Math.ceil(charCount / 400));
  }
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Safe JSON serializer for embedding inside <script type="application/ld+json">.
 * Prevents HTML tag closing injection (</script>) and entity issues.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
