import { ThemeConfig, ThemeId } from '../types';

export const THEMES: ThemeConfig[] = [
  {
    id: 'modern-light',
    name: 'Modern Light',
    isDark: false,
    accentColor: '#4f46e5',
    bgClass: 'bg-stone-100 text-stone-900',
    cardClass: 'bg-white text-stone-900 shadow-sm',
    borderClass: 'border-stone-200',
    textClass: 'text-stone-900',
    textMutedClass: 'text-stone-500',
    previewGradient: 'from-stone-100 to-indigo-100 border-stone-300',
  },
  {
    id: 'dark-midnight',
    name: 'Midnight Dark',
    isDark: true,
    accentColor: '#6366f1',
    bgClass: 'bg-slate-950 text-slate-100',
    cardClass: 'bg-slate-900 text-slate-100 shadow-lg shadow-black/40',
    borderClass: 'border-slate-800',
    textClass: 'text-slate-100',
    textMutedClass: 'text-slate-400',
    previewGradient: 'from-slate-900 to-indigo-950 border-slate-700',
  },
  {
    id: 'cyber-neon',
    name: 'Cyberpunk Neon',
    isDark: true,
    accentColor: '#06b6d4',
    bgClass: 'bg-zinc-950 text-zinc-100',
    cardClass: 'bg-zinc-900/95 text-zinc-100 shadow-lg shadow-cyan-950/30',
    borderClass: 'border-cyan-900/50',
    textClass: 'text-zinc-100',
    textMutedClass: 'text-cyan-400/80',
    previewGradient: 'from-zinc-900 to-cyan-950 border-cyan-500/40',
  },
  {
    id: 'forest-emerald',
    name: 'Nordic Emerald',
    isDark: true,
    accentColor: '#10b981',
    bgClass: 'bg-emerald-950/95 text-emerald-50',
    cardClass: 'bg-emerald-900/70 text-emerald-50 shadow-lg shadow-emerald-950/40',
    borderClass: 'border-emerald-800/60',
    textClass: 'text-emerald-50',
    textMutedClass: 'text-emerald-300/80',
    previewGradient: 'from-emerald-950 to-teal-950 border-emerald-600/40',
  },
  {
    id: 'royal-sunset',
    name: 'Royal Velvet',
    isDark: true,
    accentColor: '#ec4899',
    bgClass: 'bg-neutral-950 text-purple-50',
    cardClass: 'bg-purple-950/50 text-purple-50 shadow-lg shadow-purple-950/40',
    borderClass: 'border-purple-900/60',
    textClass: 'text-purple-50',
    textMutedClass: 'text-purple-300/80',
    previewGradient: 'from-purple-950 to-pink-950 border-pink-500/40',
  },
  {
    id: 'warm-solar',
    name: 'Solar Amber Light',
    isDark: false,
    accentColor: '#d97706',
    bgClass: 'bg-amber-50/60 text-stone-900',
    cardClass: 'bg-white text-stone-900 shadow-sm',
    borderClass: 'border-amber-200/80',
    textClass: 'text-stone-900',
    textMutedClass: 'text-amber-800/70',
    previewGradient: 'from-amber-100 to-orange-100 border-amber-300',
  },
];

const THEME_STORAGE_KEY = 'quiz_pro_theme_v3';

export function getThemeConfig(themeId?: string | ThemeId | null): ThemeConfig {
  if (themeId) {
    const found = THEMES.find((t) => t.id === themeId);
    if (found) return found;
  }
  return THEMES[0];
}

export function getSavedTheme(): ThemeConfig {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (saved) {
      const found = THEMES.find((t) => t.id === saved);
      if (found) return found;
    }
  } catch {
    // fallback
  }
  return THEMES[0];
}

export function saveTheme(themeId: ThemeId): ThemeConfig {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch (e) {
    console.error('Could not save theme', e);
  }
  return getThemeConfig(themeId);
}
