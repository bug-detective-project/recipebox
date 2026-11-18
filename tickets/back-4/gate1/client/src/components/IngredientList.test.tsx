import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi } from '../test/mockApi.ts';
import { renderApp } from '../test/renderApp.tsx';
import { IngredientList } from './IngredientList.tsx';

const ingredients = [
  { id: 11, name: 'flour', quantity: 200, unit: 'g' },
  { id: 12, name: 'egg', quantity: 2, unit: '' },
  { id: 13, name: 'milk', quantity: 300, unit: 'ml' },
];

const lines = () => screen.getAllByTestId('ingredient').map((item) => item.textContent);

describe('the list of ingredients', () => {
  it('shows every ingredient for the servings of the recipe', () => {
    render(<IngredientList ingredients={ingredients} recipeServings={4} servings={4} />);

    expect(lines()).toEqual(['200 g flour', '2 egg', '300 ml milk']);
  });

  it('shows every ingredient, each with its own quantity, for more servings', () => {
    render(<IngredientList ingredients={ingredients} recipeServings={4} servings={8} />);

    expect(lines()).toEqual(['400 g flour', '4 egg', '600 ml milk']);
  });

  it('shows every ingredient, each with its own quantity, for fewer servings', () => {
    render(<IngredientList ingredients={ingredients} recipeServings={4} servings={2} />);

    expect(lines()).toEqual(['100 g flour', '1 egg', '150 ml milk']);
  });

  it('does not change the ingredients it was given', () => {
    const before = structuredClone(ingredients);

    render(<IngredientList ingredients={ingredients} recipeServings={4} servings={6} />);

    expect(ingredients).toEqual(before);
  });
});

describe('the ingredients on the page of a recipe', () => {
  it('stay one line per ingredient while the cook changes the servings', async () => {
    mockApi();
    renderApp('/recipes/1');
    await screen.findByRole('heading', { name: 'Banana Pancakes', level: 1 });

    await userEvent.click(screen.getByRole('button', { name: 'More servings' }));
    expect(lines()).toEqual(['250 g flour', '2.5 egg', '375 ml milk']);

    await userEvent.click(screen.getByRole('button', { name: 'Fewer servings' }));
    expect(lines()).toEqual(['200 g flour', '2 egg', '300 ml milk']);

    await userEvent.click(screen.getByRole('button', { name: 'Fewer servings' }));
    expect(lines()).toEqual(['150 g flour', '1.5 egg', '225 ml milk']);
  });
});
