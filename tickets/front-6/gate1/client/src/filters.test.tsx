import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi } from './test/mockApi.ts';
import { renderApp } from './test/renderApp.tsx';

const cardTitles = () => screen.getAllByTestId('recipe-card').map((card) => within(card).getByRole('heading').textContent);
const location = () => screen.getByTestId('location').textContent;

describe('the filters of the list and the URL', () => {
  it('writes the search in the URL while the cook types', async () => {
    mockApi();
    renderApp('/');
    await screen.findByText('Lemon Tart');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'pasta');

    await waitFor(() => expect(location()).toBe('/?q=pasta'));
  });

  it('writes the category, the ingredient and the favorites in the URL', async () => {
    mockApi();
    renderApp('/');
    await screen.findByText('Lemon Tart');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'dessert');
    await waitFor(() => expect(location()).toBe('/?category=dessert'));

    await userEvent.type(screen.getByRole('searchbox', { name: 'Ingredient' }), 'egg');
    await waitFor(() => expect(new URLSearchParams(location().slice(2)).get('ingredient')).toBe('egg'));

    await userEvent.click(screen.getByRole('checkbox', { name: 'Only favorites' }));
    await waitFor(() => expect(new URLSearchParams(location().slice(2)).get('favorites')).toBe('true'));
  });

  it('takes a filter out of the URL when it is cleared', async () => {
    mockApi();
    renderApp('/?q=tart');
    await screen.findByText('Lemon Tart');

    await userEvent.clear(screen.getByRole('searchbox', { name: 'Search' }));

    await waitFor(() => expect(location()).toBe('/'));
  });

  it('starts from the filters of the URL', async () => {
    const { requests } = mockApi();
    renderApp('/?q=a&category=dessert');

    await waitFor(() => expect(cardTitles()).toEqual(['Lemon Tart']));
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('a');
    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('dessert');
    expect(requests.at(-1)!.search.toString()).toBe('q=a&category=dessert');
  });

  it('starts with "Only favorites" checked for favorites=true', async () => {
    mockApi();
    renderApp('/?favorites=true');

    await waitFor(() => expect(cardTitles()).toEqual(['Banana Pancakes']));
    expect(screen.getByRole('checkbox', { name: 'Only favorites' })).toBeChecked();
  });

  it('ignores a category that does not exist', async () => {
    mockApi();
    renderApp('/?category=brunch');

    await waitFor(() => expect(cardTitles()).toHaveLength(4));
    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('');
  });
});
