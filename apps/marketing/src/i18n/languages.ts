export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  htmlLang: string;
  ogLocale: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageMeta> = {
  en: { code: 'en', name: 'English', nativeName: 'English', htmlLang: 'en', ogLocale: 'en_US', dir: 'ltr' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', htmlLang: 'es', ogLocale: 'es_ES', dir: 'ltr' },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', htmlLang: 'nl', ogLocale: 'nl_NL', dir: 'ltr' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', htmlLang: 'fr', ogLocale: 'fr_FR', dir: 'ltr' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', htmlLang: 'ja', ogLocale: 'ja_JP', dir: 'ltr' },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', htmlLang: 'ko', ogLocale: 'ko_KR', dir: 'ltr' },
  zh: { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', htmlLang: 'zh-Hans', ogLocale: 'zh_CN', dir: 'ltr' },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', htmlLang: 'ru', ogLocale: 'ru_RU', dir: 'ltr' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', htmlLang: 'pt', ogLocale: 'pt_PT', dir: 'ltr' },
};

export const DEFAULT_LANGUAGE = 'en';

export const NON_DEFAULT_LANGUAGES = ['es', 'nl', 'fr', 'ja', 'ko', 'zh', 'ru', 'pt'] as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return lang in SUPPORTED_LANGUAGES;
}
