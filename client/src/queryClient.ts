import { QueryClient } from '@tanstack/react-query';

/**
 * The cache of what the API answered. A list is reused for a minute before it is asked for again,
 * and coming back to the window does not refetch: after a change, whoever changed the data says
 * which lists are out of date (see the mutations in api/recipes.ts).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: false },
    },
  });
}
