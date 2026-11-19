import { useSearchParams } from 'react-router';
import { CATEGORIES } from './api/types.ts';
import type { Category, RecipeFilters } from './api/types.ts';

/**
 * The filters of the recipe list live in the URL (?q=…&category=…&ingredient=…&favorites=true), so
 * a reload, a shared link and the Back button show the same list.
 */
export function useFilters(): { filters: RecipeFilters; change: (changes: Partial<RecipeFilters>) => void } {
  const [params, setParams] = useSearchParams();
  const filters: RecipeFilters = {
    q: params.get('q') ?? '',
    category: CATEGORIES.find((category) => category === params.get('category')) ?? '',
    ingredient: params.get('ingredient') ?? '',
    favorites: params.get('favorites') === 'true',
  };

  const change = (changes: Partial<RecipeFilters>) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, ...changes })) {
      if (value !== '' && value !== false) {
        next.set(key, String(value));
      }
    }
    // Typing in the search box is one visit to the list, not one per letter.
    setParams(next, { replace: true });
  };

  return { filters, change };
}

export const isCategory = (value: string): value is Category => (CATEGORIES as readonly string[]).includes(value);
