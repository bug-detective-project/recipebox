# Code review: RB-105, an answer is not always a success

The pages knew what to do with a recipe that does not exist. They never found out, because the code that fetched the recipe turned every answer, errors included, into a recipe. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- `fetch` resolves for any answer the server gives. 404 and 500 are answers. It only rejects when there is no answer at all.
- `fetchRecipe` did not check `response.ok`. It parsed the body of the 404 and spread it over `EMPTY_RECIPE`, so the page received a "recipe" with every field at its default.
- Filling in defaults also hid the problem: without them the page would have failed loudly on the first missing field.

## Why the reference fix is right

- `useRecipe` uses `request`, the helper every other call of the file uses. It throws an `ApiError` carrying the status when the answer is not a success.
- TanStack Query then puts the query in the error state, and the pages already branch on it: 404 shows "Recipe not found", anything else shows "The recipe could not be loaded".
- `EMPTY_RECIPE` is gone. The API always answers a whole recipe, so the defaults had nothing to fix and one thing to hide.
- One place decides what a failed answer is. The edit page was fixed by the same line.

## Compare with your fix

- Did you keep `fetch` and add `if (!response.ok) throw new Error(...)`? The empty recipe is gone, but a plain `Error` has no status: the page cannot tell "not found" from "the server is down", and one of the two gets the wrong message.
- Did you check in the page whether `recipe.title` is empty, or `recipe.id` is 0? It guesses from the symptom. The server already said what happened; the status is the fact.
- Did you keep `EMPTY_RECIPE` "just in case"? Ask what case. Data from your own API should be checked at the door, not patched silently.
- Did you fix `RecipePage` only? The edit form of a missing recipe needs the same answer.

## Watch for next time

- With `fetch`, always decide what happens when `response.ok` is false. Better: have one helper that decides, and call nothing else.
- Be suspicious of defaults for data that should be complete. They turn a clear failure into a wrong screen.
