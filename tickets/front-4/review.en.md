# Code review: RB-104, who tells the cache

Nothing was wrong with the save, and nothing was wrong with the list component. The client keeps copies of what the API answered, and after an edit it only threw away one of them. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- TanStack Query caches every answer under a key. This project keeps a list for a minute before asking again (`staleTime` in `queryClient.ts`), which is what makes moving between pages feel instant.
- A change on the server does not reach those copies by itself. The mutation has to say which keys are out of date.
- `useUpdateRecipe` invalidated `['recipes', 'detail', id]` only. The recipe page was refetched; every cached list still had the old recipe and was still considered fresh.

## Why the reference fix is right

- `invalidateQueries({ queryKey: ['recipes'] })` matches by prefix: every list (any filters) and every recipe page.
- It is what the other mutations of the file already do. An edit can change the title, the category and the time, all of which the lists show and filter by, so it is out of date in the same places as a creation.
- Invalidated queries that are on screen refetch now; the others refetch when they are shown again. The list is asked for once, when the cook goes back to it.

## Compare with your fix

- Did you lower `staleTime` to 0, or turn on `refetchOnMount: 'always'`? The list is right again, and every visit to it now waits for the network. The cache is not the bug; the missing invalidation is.
- Did you write the new recipe into the cached lists with `setQueryData`? It can be done well, but each cached list has its own filters and order: a renamed recipe may have to move, enter or leave a list. Invalidating lets the server decide.
- Did you add a second `invalidateQueries` for `['recipes', 'list']`? It works. One prefix says the same with less.
- Did you reload the page after the save? Everything the cook had on screen is lost with it.

## Watch for next time

- With a client cache, every change needs an answer to "which copies are now wrong?". Read the mutations of a file side by side: the one that differs is usually the bug.
- "Right after a reload, wrong before it" points at something the client is holding, not at the server.
