# Code review: RB-203, a success that did nothing

The delete worked for recipes that exist. For the others it answered the same thing, because it never looked at what the database said. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- `Recipe.destroy` does not fail when no row matches. It resolves with the number of rows removed, and here that number was thrown away.
- The route answered 204 whenever the function returned, so "removed" and "there was nothing to remove" looked the same to the caller.
- The other operations on one recipe load it first and get a `NotFoundError` for free. The delete was the only one that did not load anything.

## Why the reference fix is right

- The count of `destroy` is the fact: 0 rows means the recipe was not there, and the function throws `NotFoundError`, the same error the rest of the API uses, with the same message.
- One query. The recipe is not loaded first only to be deleted.
- An id that is not a whole number never reaches the database: it is a 404 too, like in `GET /api/recipes/abc`.
- The route did not change. It still answers 204 when the function returns, and the function now returns only when something was deleted.

## Compare with your fix

- Did you call `loadRecipe(id)` and then `destroy`? It is correct and reads well: two queries instead of one, and between them another request could delete the same recipe. For a cookbook that is fine; know that the count is the cheaper truth.
- Did you answer 404 from the route with `reply.status(404)`? It works. The route now knows a rule the other routes leave to the functions and the error handler, and the message can drift from "Recipe not found".
- Did you answer 200 with `{ deleted: false }`? A script that checks only the status still sees a success. The status is the part every client reads.
- Did you treat a repeated delete as a success because "the recipe is gone either way"? That is a defensible design in some APIs. This one answers 404 for a missing recipe everywhere else, and the ticket asks for the same here.

## Watch for next time

- A function that changes data usually tells you how much it changed. Read the return value before deciding the answer.
- When an API has a convention (404 for what is not there), check each new route against it. The odd one out is found by whoever depends on it.
