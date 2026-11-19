import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi } from '../test/mockApi.ts';
import { renderApp } from '../test/renderApp.tsx';

const card = (title: string) => screen.getAllByTestId('recipe-card').find((item) => within(item).queryByRole('heading', { name: title }));

/** From the list: opens a recipe, changes it in the edit form and saves. */
async function editFromTheList(recipe: string, change: () => Promise<void>) {
  await userEvent.click(await screen.findByRole('link', { name: recipe }));
  await userEvent.click(await screen.findByRole('link', { name: 'Edit' }));
  await screen.findByRole('textbox', { name: 'Title' });
  await change();
  await userEvent.click(screen.getByRole('button', { name: 'Save recipe' }));
}

describe('the list after a recipe is edited', () => {
  it('shows the new title', async () => {
    mockApi();
    renderApp('/');

    await editFromTheList('Lemon Tart', async () => {
      await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }));
      await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Lime Tart');
    });
    await screen.findByRole('heading', { name: 'Lime Tart', level: 1 });
    await userEvent.click(screen.getByRole('link', { name: 'All recipes' }));

    await waitFor(() => expect(card('Lime Tart')).toBeTruthy());
    expect(card('Lemon Tart')).toBeUndefined();
  });

  it('shows the new time and the new category', async () => {
    mockApi();
    renderApp('/');

    await editFromTheList('Garlic Butter Pasta', async () => {
      await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Hours' }), '1');
      await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Minutes' }), '15');
      await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'snack');
    });
    await screen.findByRole('heading', { name: 'Garlic Butter Pasta', level: 1 });
    await userEvent.click(screen.getByRole('link', { name: 'All recipes' }));

    await waitFor(() => expect(card('Garlic Butter Pasta')).toHaveTextContent('Snack · 1h15'));
  });

  it('still shows the new recipe on its own page', async () => {
    mockApi();
    renderApp('/');

    await editFromTheList('Lemon Tart', async () => {
      await userEvent.type(screen.getByRole('textbox', { name: 'Description' }), ' Now with lime.');
    });

    expect(await screen.findByText('About Lemon Tart. Now with lime.')).toBeInTheDocument();
  });
});
