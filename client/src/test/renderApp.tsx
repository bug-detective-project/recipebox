import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { App } from '../App.tsx';
import { createQueryClient } from '../queryClient.ts';

function LocationDisplay() {
  const location = useLocation();
  // Not an <output>: that element has the role "status", which the pages use for their own messages.
  return <span data-testid="location">{location.pathname + location.search}</span>;
}

/** Renders the whole app at the given URL, with a data cache of its own. */
export function renderApp(path: string) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <App />
        <LocationDisplay />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
