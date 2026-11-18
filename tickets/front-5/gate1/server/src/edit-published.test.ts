import { describe, expect, it } from 'vitest';
import type { RecipeDetail, RecipeSummary } from './recipes.ts';
import { recipeInput, useApi } from './test/api.ts';

const api = useApi();

const PANCAKES = 1;
const DRAFT = 11;

describe('editing a published recipe', () => {
  it('keeps it published', async () => {
    const { status, body } = await api.put<RecipeDetail>(`/api/recipes/${PANCAKES}`, recipeInput({ title: 'Banana Pancakes Deluxe' }));

    expect(status).toBe(200);
    expect(body).toMatchObject({ title: 'Banana Pancakes Deluxe', status: 'published' });
    expect((await api.get<RecipeDetail>(`/api/recipes/${PANCAKES}`)).body.status).toBe('published');
  });

  it('keeps its ratings', async () => {
    const before = (await api.get<RecipeDetail>(`/api/recipes/${PANCAKES}`)).body.rating;
    expect(before).toEqual({ average: 4.7, count: 3 });

    const { body } = await api.put<RecipeDetail>(`/api/recipes/${PANCAKES}`, recipeInput());

    expect(body.rating).toEqual(before);
    const listed = (await api.get<RecipeSummary[]>('/api/recipes')).body.find((recipe) => recipe.id === PANCAKES)!;
    expect(listed).toMatchObject({ status: 'published', rating: before });
  });

  it('can still be rated afterwards', async () => {
    await api.put(`/api/recipes/${PANCAKES}`, recipeInput());

    const { status, body } = await api.post(`/api/recipes/${PANCAKES}/ratings`, { stars: 5 });

    expect(status).toBe(201);
    expect(body).toEqual({ average: 4.8, count: 4 });
  });

  it('keeps a draft a draft, and a recipe published after an edit published', async () => {
    expect((await api.put<RecipeDetail>(`/api/recipes/${DRAFT}`, recipeInput())).body.status).toBe('draft');

    await api.post(`/api/recipes/${DRAFT}/publish`);
    await api.post(`/api/recipes/${DRAFT}/ratings`, { stars: 4 });
    const edited = await api.put<RecipeDetail>(`/api/recipes/${DRAFT}`, recipeInput({ title: 'Beef Stew' }));

    expect(edited.body).toMatchObject({ status: 'published', rating: { average: 4, count: 1 } });
  });

  it('still creates a new recipe as a draft', async () => {
    expect((await api.post<RecipeDetail>('/api/recipes', recipeInput())).body.status).toBe('draft');
  });
});
