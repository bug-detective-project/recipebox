import { describe, expect, it } from 'vitest';
import type { RecipeDetail, RecipeSummary } from './recipes.ts';
import { recipeInput, useApi } from './test/api.ts';

const api = useApi();

describe('the servings of a recipe', () => {
  it('are a number in the list', async () => {
    const { body } = await api.get<RecipeSummary[]>('/api/recipes');

    expect(body.find((recipe) => recipe.id === 1)!.servings).toBe(4);
    expect(body.map((recipe) => typeof recipe.servings)).toEqual(body.map(() => 'number'));
  });

  it('are a number in the recipe', async () => {
    expect((await api.get<RecipeDetail>('/api/recipes/4')).body.servings).toBe(6);
  });

  it('are saved as a number when a recipe is created and when it is edited', async () => {
    const created = await api.post<RecipeDetail>('/api/recipes', recipeInput({ servings: 3 }));
    expect(created.body.servings).toBe(3);
    expect((await api.get<RecipeDetail>(`/api/recipes/${created.body.id}`)).body.servings).toBe(3);

    const edited = await api.put<RecipeDetail>(`/api/recipes/${created.body.id}`, recipeInput({ servings: 12 }));
    expect(edited.body.servings).toBe(12);
  });

  it.each([0, -2, 101, 2.5, 'many', '4-6', ''])('refuses %j', async (servings) => {
    const { status, body } = await api.post<{ fields: Record<string, string> }>('/api/recipes', { ...recipeInput(), servings });

    expect(status).toBe(400);
    expect(Object.keys(body.fields)).toEqual(['servings']);
  });

  it('accepts 1 and 100', async () => {
    expect((await api.post('/api/recipes', recipeInput({ servings: 1 }))).status).toBe(201);
    expect((await api.post('/api/recipes', recipeInput({ servings: 100 }))).status).toBe(201);
  });
});
