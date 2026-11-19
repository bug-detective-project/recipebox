import { describe, expect, it } from 'vitest';
import { useApi } from './test/api.ts';

const api = useApi();

const NOT_FOUND = { status: 404, body: { error: 'Recipe not found' } };

describe('DELETE /api/recipes/:id for a recipe that is not there', () => {
  it('answers 404 for an id that never existed', async () => {
    expect(await api.delete('/api/recipes/999')).toEqual(NOT_FOUND);
  });

  it('answers 404 the second time the same recipe is deleted', async () => {
    expect((await api.delete('/api/recipes/9')).status).toBe(204);

    expect(await api.delete('/api/recipes/9')).toEqual(NOT_FOUND);
  });

  it.each(['abc', '1.5', '0'])('answers 404 for the id %s', async (id) => {
    expect(await api.delete(`/api/recipes/${id}`)).toEqual(NOT_FOUND);
  });

  it('still removes a recipe that exists, and only that one', async () => {
    const before = (await api.get<unknown[]>('/api/recipes')).body.length;

    expect((await api.delete('/api/recipes/3')).status).toBe(204);

    expect((await api.get('/api/recipes/3')).status).toBe(404);
    expect((await api.get<unknown[]>('/api/recipes')).body).toHaveLength(before - 1);
  });
});
