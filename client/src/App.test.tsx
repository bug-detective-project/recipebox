import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createTestRecipes, json, mockApi } from './test/mockApi.ts';
import { renderApp } from './test/renderApp.tsx';

const cardTitles = () => screen.getAllByTestId('recipe-card').map((card) => within(card).getByRole('heading').textContent);
const ingredients = () => screen.getAllByTestId('ingredient').map((item) => item.textContent);

describe('the list of recipes', () => {
  it('shows every recipe with its category, time and rating', async () => {
    mockApi();
    renderApp('/');

    await waitFor(() => expect(cardTitles()).toEqual(['Banana Pancakes', 'Garlic Butter Pasta', 'Lemon Tart', 'Slow Beef Stew']));
    const pancakes = screen.getAllByTestId('recipe-card')[0]!;
    expect(pancakes).toHaveTextContent('Breakfast · 25 min');
    expect(pancakes).toHaveTextContent('4.7 (3 ratings)');
    expect(within(pancakes).getByRole('img', { name: 'A stack of pancakes' })).toBeInTheDocument();
    expect(screen.getAllByTestId('recipe-card')[3]).toHaveTextContent('Draft');
    expect(screen.getByTestId('recipe-count')).toHaveTextContent('4 recipes');
  });

  it('filters while the cook types in the search', async () => {
    mockApi();
    renderApp('/');
    await screen.findByText('Lemon Tart');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'pasta');

    await waitFor(() => expect(cardTitles()).toEqual(['Garlic Butter Pasta']));
    expect(screen.getByTestId('recipe-count')).toHaveTextContent('1 recipe');
  });

  it('filters by category, by ingredient and by favorites', async () => {
    const { requests } = mockApi();
    renderApp('/');
    await screen.findByText('Lemon Tart');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'dessert');
    await waitFor(() => expect(cardTitles()).toEqual(['Lemon Tart']));

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Category' }), '');
    await userEvent.type(screen.getByRole('searchbox', { name: 'Ingredient' }), 'beef');
    await waitFor(() => expect(cardTitles()).toEqual(['Slow Beef Stew']));

    await userEvent.clear(screen.getByRole('searchbox', { name: 'Ingredient' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Only favorites' }));
    await waitFor(() => expect(cardTitles()).toEqual(['Banana Pancakes']));
    expect(requests.at(-1)!.search.get('favorites')).toBe('true');
  });

  it('marks and unmarks a favorite from the list', async () => {
    const { requests } = mockApi();
    renderApp('/');

    await userEvent.click(await screen.findByRole('button', { name: 'Favorite Lemon Tart' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Favorite Lemon Tart' })).toHaveAttribute('aria-pressed', 'true'));
    expect(requests.find((request) => request.method === 'PUT')?.path).toBe('/api/favorites/3');

    await userEvent.click(screen.getByRole('button', { name: 'Favorite Lemon Tart' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Favorite Lemon Tart' })).toHaveAttribute('aria-pressed', 'false'));
  });

  it('says so when the list cannot be loaded', async () => {
    mockApi({ respond: () => json({ error: 'boom' }, 500) });
    renderApp('/');

    expect(await screen.findByRole('alert')).toHaveTextContent('The recipes could not be loaded.');
  });

  it('sends the name of the cook with every request', async () => {
    const { requests } = mockApi();
    renderApp('/');
    await screen.findByText('Lemon Tart');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Cooking as' }), 'Leo');
    await userEvent.click(screen.getByRole('button', { name: 'Favorite Lemon Tart' }));

    await waitFor(() => expect(requests.find((request) => request.method === 'PUT')?.headers['x-cook']).toBe('Leo'));
  });
});

describe('the page of a recipe', () => {
  it('shows the ingredients and the steps', async () => {
    mockApi();
    renderApp('/recipes/1');

    expect(await screen.findByRole('heading', { name: 'Banana Pancakes', level: 1 })).toBeInTheDocument();
    expect(ingredients()).toEqual(['200 g flour', '2 egg', '300 ml milk']);
    expect(screen.getAllByTestId('step').map((step) => step.textContent)).toEqual(['Mix everything for Banana Pancakes.', 'Cook until golden.']);
    expect(screen.getByTestId('servings')).toHaveTextContent('4 servings');
  });

  it('gives the quantities for fewer servings', async () => {
    mockApi();
    renderApp('/recipes/1');
    await screen.findByRole('heading', { name: 'Banana Pancakes', level: 1 });

    await userEvent.click(screen.getByRole('button', { name: 'Fewer servings' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fewer servings' }));

    expect(screen.getByTestId('servings')).toHaveTextContent('2 servings');
    expect(ingredients()[0]).toBe('100 g flour');
  });

  it('opens from the list', async () => {
    mockApi();
    renderApp('/');

    await userEvent.click(await screen.findByRole('link', { name: 'Lemon Tart' }));

    expect(await screen.findByRole('heading', { name: 'Lemon Tart', level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/recipes/3');
  });

  it('sends a rating', async () => {
    const { requests } = mockApi();
    renderApp('/recipes/2');
    await screen.findByRole('heading', { name: 'Garlic Butter Pasta', level: 1 });

    await userEvent.click(screen.getByTitle('4 stars'));

    expect(await screen.findByText('Thanks for rating!')).toBeInTheDocument();
    expect(requests.find((request) => request.method === 'POST')).toMatchObject({ path: '/api/recipes/2/ratings', body: { stars: 4 } });
    await waitFor(() => expect(screen.getByTestId('rating-summary')).toHaveTextContent('4.5 (2 ratings)'));
  });

  it('publishes a draft, which can then be rated', async () => {
    mockApi();
    renderApp('/recipes/4');
    await screen.findByRole('heading', { name: 'Slow Beef Stew', level: 1 });
    expect(screen.queryByTitle('5 stars')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));

    expect(await screen.findByTitle('5 stars')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
  });

  it('deletes the recipe and goes back to the list', async () => {
    mockApi();
    renderApp('/recipes/3');
    await screen.findByRole('heading', { name: 'Lemon Tart', level: 1 });

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(cardTitles()).toEqual(['Banana Pancakes', 'Garlic Butter Pasta', 'Slow Beef Stew']));
    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });
});

describe('the form of a recipe', () => {
  it('creates a recipe and opens its page', async () => {
    const { requests } = mockApi();
    renderApp('/recipes/new');

    await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Tomato Soup');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Minutes' }), '40');
    await userEvent.clear(screen.getByRole('spinbutton', { name: 'Quantity of ingredient 1' }));
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Quantity of ingredient 1' }), '800');
    await userEvent.type(screen.getByRole('textbox', { name: 'Unit of ingredient 1' }), 'g');
    await userEvent.type(screen.getByRole('textbox', { name: 'Name of ingredient 1' }), 'tomato');
    await userEvent.click(screen.getByRole('button', { name: 'Add ingredient' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Name of ingredient 2' }), 'onion');
    await userEvent.type(screen.getByRole('textbox', { name: 'Step 1' }), 'Simmer and blend.');
    await userEvent.click(screen.getByRole('button', { name: 'Save recipe' }));

    expect(await screen.findByRole('heading', { name: 'Tomato Soup', level: 1 })).toBeInTheDocument();
    expect(requests.find((request) => request.method === 'POST')!.body).toEqual({
      title: 'Tomato Soup',
      description: '',
      category: 'main',
      servings: 4,
      prepTime: '40 min',
      photo: null,
      ingredients: [
        { name: 'tomato', quantity: 800, unit: 'g' },
        { name: 'onion', quantity: 1, unit: '' },
      ],
      steps: ['Simmer and blend.'],
    });
    expect(ingredients()).toEqual(['800 g tomato', '1 onion']);
  });

  it('asks for a title and a time before sending anything', async () => {
    const { requests } = mockApi();
    renderApp('/recipes/new');

    await userEvent.click(screen.getByRole('button', { name: 'Save recipe' }));

    expect(await screen.findByText('Give the recipe a title')).toBeInTheDocument();
    expect(screen.getByText('How long does it take?')).toBeInTheDocument();
    expect(screen.getByText('Write a quantity above zero and a name')).toBeInTheDocument();
    expect(requests.filter((request) => request.method === 'POST')).toEqual([]);
  });

  it('starts the edit form from the recipe and saves the changes', async () => {
    const { requests } = mockApi();
    renderApp('/recipes/1/edit');

    const title = await screen.findByRole('textbox', { name: 'Title' });
    expect(title).toHaveValue('Banana Pancakes');
    expect(screen.getByRole('combobox', { name: 'Hours' })).toHaveValue('0');
    expect(screen.getByRole('combobox', { name: 'Minutes' })).toHaveValue('25');
    expect(screen.getAllByTestId('ingredient-row')).toHaveLength(3);

    await userEvent.clear(title);
    await userEvent.type(title, 'Banana Crepes');
    await userEvent.click(screen.getByRole('button', { name: 'Add ingredient' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Name of ingredient 4' }), 'sugar');
    await userEvent.click(screen.getByRole('button', { name: 'Save recipe' }));

    expect(await screen.findByRole('heading', { name: 'Banana Crepes', level: 1 })).toBeInTheDocument();
    expect(requests.find((request) => request.method === 'PUT')).toMatchObject({ path: '/api/recipes/1', body: { title: 'Banana Crepes', prepTime: '25 min' } });
    expect(ingredients()).toEqual(['200 g flour', '2 egg', '300 ml milk', '1 sugar']);
  });

  it('removes a row from the form', async () => {
    mockApi();
    renderApp('/recipes/1/edit');
    await screen.findByRole('textbox', { name: 'Title' });

    await userEvent.click(screen.getByRole('button', { name: 'Remove ingredient 2' }));

    expect(screen.getAllByTestId('ingredient-row')).toHaveLength(2);
    expect(screen.getByRole('textbox', { name: 'Name of ingredient 2' })).toHaveValue('milk');
  });

  it('shows what the API refused next to the field', async () => {
    mockApi({ respond: (request) => (request.method === 'PUT' ? json({ error: 'Some fields are not valid', fields: { prepTime: 'Write the time like 45 min or 1h30' } }, 400) : undefined) });
    renderApp('/recipes/1/edit');
    await screen.findByRole('textbox', { name: 'Title' });

    await userEvent.click(screen.getByRole('button', { name: 'Save recipe' }));

    expect(await screen.findByText('Write the time like 45 min or 1h30')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/recipes/1/edit');
  });
});

describe('an address that does not exist', () => {
  it('shows the not found page', () => {
    mockApi();
    renderApp('/nowhere');

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});

describe('the preparation time', () => {
  it('is picked as hours and minutes and sent as the text the API reads', async () => {
    const { requests } = mockApi();
    renderApp('/recipes/1/edit');
    await screen.findByRole('textbox', { name: 'Title' });
    const group = screen.getByRole('group', { name: 'Preparation time' });

    await userEvent.selectOptions(within(group).getByRole('combobox', { name: 'Hours' }), '1');
    await userEvent.selectOptions(within(group).getByRole('combobox', { name: 'Minutes' }), '30');
    await userEvent.click(screen.getByRole('button', { name: 'Save recipe' }));

    await waitFor(() => expect(requests.find((request) => request.method === 'PUT')).toMatchObject({ body: { prepTime: '1h30' } }));
  });

  it('keeps minutes that are not a multiple of five', async () => {
    const recipes = createTestRecipes();
    recipes[0]!.prepMinutes = 27;
    mockApi({ recipes });
    renderApp('/recipes/1/edit');

    expect(await screen.findByRole('combobox', { name: 'Minutes' })).toHaveValue('27');
  });
});
