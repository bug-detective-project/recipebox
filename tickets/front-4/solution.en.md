# Solution: The edit tells every copy

**Root cause.** `useUpdateRecipe` in `client/src/api/recipes.ts` invalidates only the key of the recipe page (`['recipes', 'detail', id]`). The cached lists (`['recipes', 'list', filters]`) stay fresh for a minute (`staleTime`), so the list shows the recipe as it was before the edit.

## Step by step

1. **Reproduce it and watch the network tab.** After the save, going back to the list makes no request to `/api/recipes`.
2. **Compare the mutations.** `useCreateRecipe` and `useDeleteRecipe` invalidate `['recipes']`; `useUpdateRecipe` invalidates a single recipe.
3. **Invalidate every copy.**

   ```ts
   export function useUpdateRecipe() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: ({ id, input }: { id: number; input: RecipeInput }) => request<RecipeDetail>(`/api/recipes/${id}`, { method: 'PUT', body: input }),
       onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
     });
   }
   ```

The reference also adds a regression test, `client/src/api/recipes.cache.test.tsx`: from the list, a recipe is edited and the list is opened again, with a new title and with a new time and category.

Then run `npm test`, repeat the steps of the ticket, and move the card to **In QA**.
