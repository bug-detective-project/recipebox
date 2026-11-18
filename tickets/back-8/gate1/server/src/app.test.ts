import { describe, expect, it } from 'vitest';
import { recipeInput, useApi } from './test/api.ts';

const api = useApi();

describe('the API', () => {
  it('answers only the local host', async () => {
    const response = await api.app().inject({ method: 'GET', url: '/api/recipes', headers: { host: 'evil.example' } });

    expect(response.statusCode).toBe(403);
  });

  it('answers 404 with JSON for an address that does not exist', async () => {
    expect(await api.get('/api/nothing')).toEqual({ status: 404, body: { error: 'Not found' } });
  });

  it('names every field that does not fit', async () => {
    const { status, body } = await api.post<{ fields: Record<string, string> }>('/api/recipes', {
      ...recipeInput(),
      title: '  ',
      category: 'brunch',
      ingredients: [{ name: 'salt', quantity: 0 }],
      steps: [''],
    });

    expect(status).toBe(400);
    expect(Object.keys(body.fields).sort()).toEqual(['category', 'ingredients.0.quantity', 'steps.0', 'title']);
  });

  it('names a field that is missing', async () => {
    const { title: _title, ...withoutTitle } = recipeInput();

    const { status, body } = await api.post<{ fields: Record<string, string> }>('/api/recipes', withoutTitle);

    expect(status).toBe(400);
    expect(body.fields).toEqual({ title: 'is required' });
  });

  it('drops a field it does not know', async () => {
    const { status, body } = await api.post('/api/recipes', { ...recipeInput(), secret: true });

    expect(status).toBe(201);
    expect(body).not.toHaveProperty('secret');
  });

  it('refuses a body that is not JSON with 400', async () => {
    const response = await api.app().inject({ method: 'POST', url: '/api/recipes', payload: '{nope', headers: { 'host': 'localhost', 'content-type': 'application/json' } });

    expect(response.statusCode).toBe(400);
  });
});
