import { describe, expect, it } from 'vitest';
import type { RecipeDetail } from './recipes.ts';
import { recipeInput, useApi } from './test/api.ts';

const api = useApi();

const DRAFT = 11;
const AS_LEO = { 'x-cook': 'Leo' };

/** The lines the server logged about changes to recipes. */
const changes = () => api.log.filter((line) => line.event === 'recipe.changed');

describe('the log line of a change to a recipe', () => {
  it('says who created a recipe', async () => {
    const { body } = await api.post<RecipeDetail>('/api/recipes', recipeInput(), AS_LEO);

    expect(changes()).toHaveLength(1);
    expect(changes()[0]).toMatchObject({ event: 'recipe.changed', action: 'created', recipeId: body.id, cook: 'Leo' });
  });

  it('says who edited, published and deleted a recipe', async () => {
    await api.put(`/api/recipes/${DRAFT}`, recipeInput(), { 'x-cook': 'Marta' });
    await api.post(`/api/recipes/${DRAFT}/publish`, undefined, { 'x-cook': 'Bianca' });
    await api.delete(`/api/recipes/${DRAFT}`, AS_LEO);

    expect(changes().map(({ action, recipeId, cook }) => ({ action, recipeId, cook }))).toEqual([
      { action: 'updated', recipeId: DRAFT, cook: 'Marta' },
      { action: 'published', recipeId: DRAFT, cook: 'Bianca' },
      { action: 'deleted', recipeId: DRAFT, cook: 'Leo' },
    ]);
  });

  it('is an info line of the request, with the id of the request', async () => {
    await api.put(`/api/recipes/${DRAFT}`, recipeInput(), AS_LEO);

    const [line] = changes();
    const request = api.log.find((other) => other.msg === 'incoming request' && other.reqId === line!.reqId);
    expect(line!.level).toBe(30);
    expect(line!.reqId).toBeTruthy();
    expect(request).toBeTruthy();
  });

  it('says "unknown" when the request does not say who the cook is', async () => {
    await api.put(`/api/recipes/${DRAFT}`, recipeInput());

    expect(changes()[0]).toMatchObject({ action: 'updated', cook: 'unknown' });
  });

  it.each(['', '   ', 'x'.repeat(41), '<script>', 'a;b', 'Leo_Smith'])('says "unknown" for the name %j', async (name) => {
    await api.put(`/api/recipes/${DRAFT}`, recipeInput(), { 'x-cook': name });

    expect(changes()[0]).toMatchObject({ cook: 'unknown' });
  });

  it.each(['Ana Maria', 'D\'Angelo', 'J. P. Souza-Lima', 'Cook 2', 'x'.repeat(40)])('accepts the name %j', async (name) => {
    await api.put(`/api/recipes/${DRAFT}`, recipeInput(), { 'x-cook': name });

    expect(changes()[0]).toMatchObject({ cook: name });
  });

  it('leaves the spaces around a name out', async () => {
    await api.put(`/api/recipes/${DRAFT}`, recipeInput(), { 'x-cook': '  Leo ' });

    expect(changes()[0]).toMatchObject({ cook: 'Leo' });
  });

  it('writes nothing for a change that did not happen', async () => {
    await api.put('/api/recipes/999', recipeInput(), AS_LEO);
    await api.put(`/api/recipes/${DRAFT}`, recipeInput({ title: '' }), AS_LEO);
    await api.post('/api/recipes/999/publish', undefined, AS_LEO);
    await api.post('/api/recipes', recipeInput({ prepTime: 'soon' }), AS_LEO);

    expect(changes()).toEqual([]);
  });

  it('writes nothing for what does not change a recipe', async () => {
    await api.get('/api/recipes');
    await api.get('/api/recipes/1');
    await api.post('/api/recipes/1/ratings', { stars: 5 }, AS_LEO);
    await api.put('/api/favorites/1', undefined, AS_LEO);

    expect(changes()).toEqual([]);
  });

  it('never carries what the cook typed', async () => {
    await api.post('/api/recipes', recipeInput({ title: 'Secret Family Sauce', description: 'Do not share.' }), AS_LEO);

    const line = JSON.stringify(changes()[0]);
    expect(line).not.toContain('Secret Family Sauce');
    expect(line).not.toContain('Do not share');
    expect(Object.keys(changes()[0]!).sort()).toEqual(['action', 'cook', 'event', 'hostname', 'level', 'msg', 'pid', 'recipeId', 'reqId', 'time']);
  });
});
