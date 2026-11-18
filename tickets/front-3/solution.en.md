# Solution: The address is the state

**Root cause.** `useFilters` in `client/src/filters.ts` keeps the filters of the list in `useState`. The state dies when `RecipesPage` is unmounted (opening a recipe, reloading), and the address never carries the filters.

## Step by step

1. **Reproduce it.** Search for `tart`, open the recipe, go back: the search box is empty and the address was always `/`.
2. **Find where the filters live.** `RecipesPage` calls `useFilters()`; the hook is a `useState`.
3. **Keep them in the query string.**

   ```ts
   export function useFilters(): { filters: RecipeFilters; change: (changes: Partial<RecipeFilters>) => void } {
     const [params, setParams] = useSearchParams();
     const filters: RecipeFilters = {
       q: params.get('q') ?? '',
       category: CATEGORIES.find((category) => category === params.get('category')) ?? '',
       ingredient: params.get('ingredient') ?? '',
       favorites: params.get('favorites') === 'true',
     };

     const change = (changes: Partial<RecipeFilters>) => {
       const next = new URLSearchParams();
       for (const [key, value] of Object.entries({ ...filters, ...changes })) {
         if (value !== '' && value !== false) {
           next.set(key, String(value));
         }
       }
       // Typing in the search box is one visit to the list, not one per letter.
       setParams(next, { replace: true });
     };

     return { filters, change };
   }
   ```

The reference also adds a regression test, `client/src/filters.test.tsx`: each filter written to the address, a cleared filter leaving it, and a list that starts from the filters of the address.

Then run `npm test`, repeat the steps of the ticket, and move the card to **In QA**.
