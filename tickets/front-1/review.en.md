# Code review: RB-101, the form is the list

The form held the right list the whole time. The function that turns the form into a request rebuilt the list from the saved recipe and brought back what the cook had removed. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- `useFieldArray` keeps the rows of the form. **Remove** calls `remove(index)`, and the row really leaves the form values.
- `inputOf` did not trust those values. It walked the ingredients of the saved recipe by position and used the row of the form "when there was one". With fewer rows in the form, the last positions had none, and the saved rows filled them.
- That is why the last ingredient came back unchanged, and why removing one in the middle shifted the others up and repeated the last.

## Why the reference fix is right

- `ingredients: values.ingredients`. The API replaces the whole list on every save, so what it needs is the list of the form, nothing more.
- `inputOf` takes only the values again, so creating and editing build the request the same way.
- No merge by position is left. Position stops meaning anything the moment a row is removed or added in the middle.

## Compare with your fix

- Did you keep the merge and cut the result to the length of the form? The removed last row stays removed, but check a removal in the middle: are the names and quantities still the ones of the form?
- Did you match saved and form rows by name or by id? It works until two rows have the same name, and it keeps code the feature does not need.
- Did you change the **Remove** button? It was right: the row was leaving the form.
- Did you change the server? The server saved what it was sent.

## Watch for next time

- When a screen shows one thing and the request carries another, read the code between the two before anything else.
- Merging two lists by position is only safe when nothing can be inserted or removed. In a form, something always can.
