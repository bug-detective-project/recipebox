import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi } from '../test/mockApi.ts';
import { renderApp } from '../test/renderApp.tsx';

const MESSAGE = 'Add at least one ingredient';

/** Fills what a new recipe needs besides its ingredients. */
async function fillTheRest() {
  await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Plain Water');
  await userEvent.type(screen.getByRole('textbox', { name: 'Preparation time' }), '1 min');
  await userEvent.type(screen.getByRole('textbox', { name: 'Step 1' }), 'Pour.');
}

describe('a recipe without ingredients', () => {
  it('is not sent when a new recipe has none', async () => {
    const { requests } = mockApi();
    renderApp('/recipes/new');
    await fillTheRest();

    await userEvent.click(screen.getByRole('button', { name: 'Remove ingredient 1' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save recipe' }));

    expect(await screen.findByText(MESSAGE)).toBeInTheDocument();
    expect(requests.filter((request) => request.method === 'POST')).toEqual([]);
    expect(screen.getByTestId('location')).toHaveTextContent('/recipes/new');
  });

  it('is not sent when every ingredient of a saved recipe was removed', async () => {
    const { requests } = mockApi();
    renderApp('/recipes/1/edit');
    await screen.findByRole('textbox', { name: 'Title' });

    for (let left = 3; left > 0; left -= 1) {
      await userEvent.click(screen.getByRole('button', { name: 'Remove ingredient 1' }));
    }
    await userEvent.click(screen.getByRole('button', { name: 'Save recipe' }));

    expect(await screen.findByText(MESSAGE)).toBeInTheDocument();
    expect(requests.filter((request) => request.method === 'PUT')).toEqual([]);
  });

  it('is sent once an ingredient is added, and the message goes away', async () => {
    const { requests } = mockApi();
    renderApp('/recipes/new');
    await fillTheRest();
    await userEvent.click(screen.getByRole('button', { name: 'Remove ingredient 1' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save recipe' }));
    await screen.findByText(MESSAGE);

    await userEvent.click(screen.getByRole('button', { name: 'Add ingredient' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Name of ingredient 1' }), 'water');
    await userEvent.click(screen.getByRole('button', { name: 'Save recipe' }));

    await waitFor(() => expect(requests.filter((request) => request.method === 'POST')).toHaveLength(1));
    expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument();
  });

  it('does not complain while there is one ingredient', async () => {
    mockApi();
    renderApp('/recipes/new');
    await fillTheRest();
    await userEvent.type(screen.getByRole('textbox', { name: 'Name of ingredient 1' }), 'water');

    await userEvent.click(screen.getByRole('button', { name: 'Save recipe' }));

    expect(await screen.findByRole('heading', { name: 'Plain Water', level: 1 })).toBeInTheDocument();
    expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument();
  });
});
