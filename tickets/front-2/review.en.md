# Code review: RB-102, a rule that is never asked

The form had a rule for the ingredient list and a place to show its message. The rule was written with an option that the library skips for an empty list. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- The ingredients are a field array, and a field array can have rules of its own: `useFieldArray({ rules })`.
- The rule was `minLength: { value: 1, … }`. It reads like "at least one item", and in React Hook Form `minLength` is only checked when the field is not empty. Emptiness is what `required` is for.
- An empty array is an empty value. So the rule worked for every list except the one it was written for.

## Why the reference fix is right

- `validate: (items) => items.length > 0 || 'Add at least one ingredient'` says exactly what is wanted and runs for any value, empty or not.
- The message goes to `errors.ingredients.root`, the place of the rules of a whole list, and the form already rendered it there.
- `handleSubmit` runs the rules before it calls the submit function, so a failing rule means no request at all. There is no second check to write before `save`.

## Compare with your fix

- Did you check `values.ingredients.length` inside the submit function and call `setError`? It stops the request, but the rule now lives outside the form's validation: the message does not clear by itself when a row is added, and the next person looks for it in `rules`.
- Did you disable the **Remove** button of the last row? The list can no longer be empty, and the cook cannot clear a row they added by mistake either. It also leaves the misleading rule in place.
- Did you put the check on the server? The server accepts a draft without ingredients on purpose; publishing is where it refuses. The ticket is about the form.

## Watch for next time

- An option of a library means what its documentation says, not what its name suggests. When a rule "does not fire", read the rule's reference before reading your own code a third time.
- Test a validation with the value it exists for. Here that was the empty list, the one case never tried.
