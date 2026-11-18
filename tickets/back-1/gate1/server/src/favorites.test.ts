import { describe, expect, it } from 'vitest';
import type { RecipeDetail, RecipeSummary } from './recipes.ts';
import { useApi } from './test/api.ts';

const api = useApi();

// In the sample cookbook the pancakes (1), the chicken (4) and the mug cake (6) are favorites.
const PANCAKES = 1;
const PASTA = 3;

const favoriteOnPage = async (id: number) => (await api.get<RecipeDetail>(`/api/recipes/${id}`)).body.favorite;
const favoriteInList = async (id: number) => (await api.get<RecipeSummary[]>('/api/recipes')).body.find((recipe) => recipe.id === id)!.favorite;
const list = async (query: string) => (await api.get<RecipeSummary[]>(`/api/recipes?${query}`)).body.map((recipe) => recipe.title);

describe('the favorite mark on the recipe itself', () => {
  it('is there for a favorite and not for the others', async () => {
    expect(await favoriteOnPage(PANCAKES)).toBe(true);
    expect(await favoriteOnPage(PASTA)).toBe(false);
  });

  it('follows the mark being put and taken away, like the list does', async () => {
    await api.put(`/api/favorites/${PASTA}`);
    expect(await favoriteOnPage(PASTA)).toBe(true);
    expect(await favoriteInList(PASTA)).toBe(true);

    expect((await api.delete(`/api/favorites/${PASTA}`)).status).toBe(204);
    expect(await favoriteOnPage(PASTA)).toBe(false);
    expect(await favoriteInList(PASTA)).toBe(false);
  });

  it('is in the answer of an edit too', async () => {
    const recipe = (await api.post<RecipeDetail>(`/api/recipes/11/publish`)).body;
    expect(recipe.favorite).toBe(false);

    await api.put('/api/favorites/11');

    expect((await api.post<RecipeDetail>(`/api/recipes/11/publish`)).body.favorite).toBe(true);
  });
});

describe('taking a favorite mark away', () => {
  it('is not an error when the mark is not there', async () => {
    expect((await api.delete(`/api/favorites/${PASTA}`)).status).toBe(204);
    expect((await api.delete(`/api/favorites/${PASTA}`)).status).toBe(204);
  });

  it('answers 404 for a recipe that does not exist', async () => {
    expect(await api.delete('/api/favorites/999')).toEqual({ status: 404, body: { error: 'Recipe not found' } });
  });
});

describe('GET /api/recipes?favorites=true', () => {
  it('lists only the favorites, by title', async () => {
    expect(await list('favorites=true')).toEqual(['Banana Pancakes', 'Chocolate Mug Cake', 'Roast Chicken with Lemon']);
  });

  it('follows the marks', async () => {
    await api.put(`/api/favorites/${PASTA}`);
    await api.delete(`/api/favorites/${PANCAKES}`);

    expect(await list('favorites=true')).toEqual(['Chocolate Mug Cake', 'Garlic Butter Pasta', 'Roast Chicken with Lemon']);
  });

  it('works together with the ingredient filter', async () => {
    expect(await list('favorites=true&ingredient=egg')).toEqual(['Banana Pancakes', 'Chocolate Mug Cake']);
    expect(await list('favorites=true&ingredient=honey')).toEqual([]);
  });

  it('lists everything with favorites=false', async () => {
    expect(await list('favorites=false')).toHaveLength(12);
  });
});
