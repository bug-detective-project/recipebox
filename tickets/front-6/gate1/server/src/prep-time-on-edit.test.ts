import { describe, expect, it } from 'vitest';
import type { RecipeDetail } from './recipes.ts';
import { recipeInput, useApi } from './test/api.ts';

const api = useApi();

const DRAFT = 11;

describe('the preparation time, when a recipe is created and when it is edited', () => {
  it.each([
    ['45', 45],
    ['45min', 45],
    ['45 min', 45],
    ['1h', 60],
    ['1h30', 90],
    ['1h 30min', 90],
    ['2H15', 135],
  ])('reads %j the same way in both', async (prepTime, minutes) => {
    const created = await api.post<RecipeDetail>('/api/recipes', recipeInput({ prepTime }));
    const edited = await api.put<RecipeDetail>(`/api/recipes/${DRAFT}`, recipeInput({ prepTime }));

    expect(created.status).toBe(201);
    expect(created.body.prepMinutes).toBe(minutes);
    expect(edited.status).toBe(200);
    expect(edited.body.prepMinutes).toBe(minutes);
  });

  it.each(['', 'soon', 'h30', '1h90', '0'])('refuses %j with the same answer in both', async (prepTime) => {
    const created = await api.post('/api/recipes', recipeInput({ prepTime }));
    const edited = await api.put(`/api/recipes/${DRAFT}`, recipeInput({ prepTime }));

    expect(created).toEqual({ status: 400, body: { error: 'Some fields are not valid', fields: { prepTime: 'Write the time like 45 min or 1h30' } } });
    expect(edited).toEqual(created);
  });

  it('saves a recipe of more than an hour again without changing its time', async () => {
    const chicken = (await api.get<RecipeDetail>('/api/recipes/4')).body;
    expect(chicken.prepMinutes).toBe(90);

    const edited = await api.put<RecipeDetail>('/api/recipes/4', recipeInput({ title: chicken.title, prepTime: '1h30' }));

    expect(edited.status).toBe(200);
    expect(edited.body.prepMinutes).toBe(90);
  });
});
