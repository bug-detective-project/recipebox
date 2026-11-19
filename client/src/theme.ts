import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'recipebox-theme';

export function storedTheme(): Theme {
  return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

/** The theme is an attribute of <html>: styles.css gives each color token a value per theme. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  // The new colors are painted at once: a transition would show each control fading from the old ones.
  root.dataset.themeSwitching = '';
  root.dataset.theme = theme;
  requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.themeSwitching));
}

/** The theme the cook chose, kept between visits. */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(storedTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, toggle: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')) };
}
