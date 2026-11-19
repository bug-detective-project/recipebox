import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { json, mockApi } from '../test/mockApi.ts';
import { renderApp } from '../test/renderApp.tsx';

describe('a recipe the API does not have', () => {
  it.each(['/recipes/999', '/recipes/abc'])('shows "Recipe not found" at %s', async (path) => {
    mockApi();
    renderApp(path);

    expect(await screen.findByRole('heading', { name: 'Recipe not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to the recipes' })).toHaveAttribute('href', '/');
  });

  it('shows nothing of a recipe: no ingredients, no steps, no buttons', async () => {
    mockApi();
    renderApp('/recipes/999');
    await screen.findByRole('heading', { name: 'Recipe not found' });

    expect(screen.queryByRole('heading', { name: 'Ingredients' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Steps' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('servings')).not.toBeInTheDocument();
  });

  it('shows "Recipe not found" instead of an empty edit form', async () => {
    mockApi();
    renderApp('/recipes/999/edit');

    expect(await screen.findByRole('heading', { name: 'Recipe not found' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save recipe' })).not.toBeInTheDocument();
  });
});

describe('a recipe the API could not answer', () => {
  it('says that the recipe could not be loaded', async () => {
    mockApi({ respond: (request) => (request.path === '/api/recipes/1' ? json({ error: 'Internal server error' }, 500) : undefined) });
    renderApp('/recipes/1');

    expect(await screen.findByRole('alert')).toHaveTextContent('The recipe could not be loaded.');
    expect(screen.queryByRole('heading', { name: 'Ingredients' })).not.toBeInTheDocument();
  });
});

describe('a recipe the API has', () => {
  it('is still shown', async () => {
    mockApi();
    renderApp('/recipes/2');

    expect(await screen.findByRole('heading', { name: 'Garlic Butter Pasta', level: 1 })).toBeInTheDocument();
  });
});
