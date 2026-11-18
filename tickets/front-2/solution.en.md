# Solution: A rule that is asked for an empty list

**Root cause.** The ingredient list is validated with `rules: { minLength: { value: 1, … } }` in the `useFieldArray` of `client/src/components/RecipeForm.tsx`. React Hook Form only checks `minLength` when the field has a value, and an empty array is an empty value: the rule is skipped exactly when the list has no rows.

## Step by step

1. **Reproduce it.** In **New recipe**, remove the only ingredient row, fill the rest and save: the recipe is created.
2. **Find the rule.** `useFieldArray({ control, name: 'ingredients', rules: { minLength: … } })`.
3. **Write a rule that runs for an empty list.**

   ```ts
   const ingredients = useFieldArray({
     control,
     name: 'ingredients',
     // A rule of the whole list: its message is errors.ingredients.root.
     rules: { validate: (items) => items.length > 0 || 'Add at least one ingredient' },
   });
   ```

   The form already shows `errors.ingredients.root.message`, and `handleSubmit` does not call `save` while the rule fails.

The reference also adds a regression test, `client/src/components/RecipeForm.ingredients.test.tsx`: a new recipe without ingredients, a saved recipe with every row removed, the message going away after a row is added, and a recipe with one ingredient.

Then run `npm test`, repeat the steps of the ticket, and move the card to **In QA**.
