import { useState } from 'react';
import { CATEGORIES } from './api/types.ts';
import type { Category, RecipeFilters } from './api/types.ts';

const NO_FILTERS: RecipeFilters = { q: '', category: '', ingredient: '', favorites: false };

/** The filters of the recipe list: what the cook typed and picked above the list. */
export function useFilters(): { filters: RecipeFilters; change: (changes: Partial<RecipeFilters>) => void } {
  const [filters, setFilters] = useState(NO_FILTERS);

  const change = (changes: Partial<RecipeFilters>) => {
    setFilters((current) => ({ ...current, ...changes }));
  };

  return { filters, change };
}

export const isCategory = (value: string): value is Category => (CATEGORIES as readonly string[]).includes(value);
