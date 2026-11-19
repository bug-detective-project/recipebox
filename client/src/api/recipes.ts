import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { currentCook } from '../cook.ts';
import { request } from './http.ts';
import type { RatingSummary, RecipeDetail, RecipeFilters, RecipeInput, RecipeSummary } from './types.ts';

function toSearch(filters: RecipeFilters): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== false) {
      search.set(key, String(value));
    }
  }
  return search.toString();
}

/** The list of recipes for these filters. While another list loads, the one on screen stays. */
export function useRecipes(filters: RecipeFilters) {
  return useQuery({
    queryKey: ['recipes', 'list', filters],
    queryFn: () => request<RecipeSummary[]>(`/api/recipes?${toSearch(filters)}`),
    placeholderData: keepPreviousData,
  });
}

/** What a recipe has when the answer of the API leaves a field out. */
const EMPTY_RECIPE: RecipeDetail = {
  id: 0,
  title: '',
  description: '',
  category: 'main',
  status: 'draft',
  servings: 1,
  prepMinutes: 0,
  photo: null,
  rating: { average: null, count: 0 },
  favorite: false,
  ingredients: [],
  steps: [],
};

/** One recipe, with every field the page reads filled in. */
async function fetchRecipe(id: string | undefined): Promise<RecipeDetail> {
  const response = await fetch(`/api/recipes/${id}`, { headers: { 'X-Cook': currentCook() } });
  const data = (await response.json()) as Partial<RecipeDetail>;
  return { ...EMPTY_RECIPE, ...data };
}

export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: ['recipes', 'detail', id],
    queryFn: () => fetchRecipe(id),
    enabled: id !== undefined,
  });
}

// Every list and every recipe page is a copy kept in the cache. A change on the server does not
// reach those copies by itself: each mutation below marks them out of date when it succeeds.

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecipeInput) => request<RecipeDetail>('/api/recipes', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: RecipeInput }) => request<RecipeDetail>(`/api/recipes/${id}`, { method: 'PUT', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => request<void>(`/api/recipes/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function usePublishRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => request<RecipeDetail>(`/api/recipes/${id}/publish`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useRateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stars }: { id: number; stars: number }) => request<RatingSummary>(`/api/recipes/${id}/ratings`, { method: 'POST', body: { stars } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

/** Puts or takes away the favorite mark of a recipe. */
export function useSetFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, favorite }: { id: number; favorite: boolean }) => request<void>(`/api/favorites/${id}`, { method: favorite ? 'PUT' : 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });
}
