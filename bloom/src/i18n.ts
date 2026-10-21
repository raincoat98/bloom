import { useSyncExternalStore } from 'react';
import pages from './locales/pages';
import { components } from './locales/components';
import { app } from './locales/app';

export type Language = 'ko' | 'en' | 'ja' | 'zh';
const languages: Language[] = ['ko', 'en', 'ja', 'zh'];
const storageKey = 'bloom-language';
const dictionaries: Record<string, [string, string, string]> = { ...app, ...pages, ...components };
const listeners = new Set<() => void>();

function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(storageKey);
    if (languages.includes(saved as Language)) return saved as Language;
  } catch { /* storage may be unavailable */ }
  const browser = typeof document === 'undefined' || typeof document.createElement !== 'function' || typeof navigator === 'undefined' ? 'ko' : navigator.language.toLowerCase();
  return browser.startsWith('ja') ? 'ja' : browser.startsWith('zh') ? 'zh' : browser.startsWith('en') ? 'en' : 'ko';
}

let current: Language | undefined;
export function getLanguage(): Language {
  return current ?? (current = initialLanguage());
}
export function setLanguage(language: Language): void {
  if (getLanguage() === language) return;
  current = language;
  try { localStorage.setItem(storageKey, language); } catch { /* session-only preference */ }
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function translate(key: string, params?: Record<string, string | number>): string {
  const index = languages.indexOf(getLanguage()) - 1;
  const text = index < 0 ? key : dictionaries[key]?.[index] ?? key;
  return params ? text.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match)) : text;
}
export function useI18n() {
  const language = useSyncExternalStore(subscribe, getLanguage, () => 'ko' as Language);
  return { language, setLanguage, t: translate };
}
export function initLanguage() {
  const language = getLanguage();
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
}
