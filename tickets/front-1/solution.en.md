# Solution: The form is the list

**Root cause.** `inputOf` in `client/src/components/RecipeForm.tsx` builds the `ingredients` of the request from the ingredients of the saved recipe, position by position, and only uses the row of the form when the form has a row at that position. After a removal the form has fewer rows, so the saved rows fill the end of the list.

## Step by step

1. **See it in the request.** Open the browser's network tab, remove the last ingredient and save: the `PUT /api/recipes/1` already carries five ingredients.
2. **Find who builds the request.** `handleSubmit` calls `save(inputOf(values, editing))`. `inputOf` is the only place where `editing.ingredients` meets the form.
3. **Send the list of the form.**

   ```ts
   function inputOf(values: RecipeFormValues): RecipeInput {
     return {
       // …
       ingredients: values.ingredients,
       steps: values.steps.map((step) => step.text),
     };
   }
   ```

   and, in the submit, `await save(inputOf(values));`.

The reference also adds a regression test, `client/src/components/RecipeForm.remove.test.tsx`: the last row removed, a row of the middle removed, two rows removed, and a removal followed by a new row.

Then run `npm test`, repeat the steps of the ticket, and move the card to **In QA**.
