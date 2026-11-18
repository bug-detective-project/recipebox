# Code review: RB-206, what an edit is allowed to change

An edit should change what the cook typed. This one also reset the status and deleted the ratings, because of a value that was right for a creation and a "rule" nobody asked for. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- `fieldsOf` turns the request into columns, for creating and for editing. It included `status: 'draft'`. In a creation that is true; in an edit it overwrote `published`.
- `updateRecipe` then deleted the ratings of the recipe, with the comment "ratings are of published recipes only". That sentence is about who may **be rated**. The code turned it into a reason to delete what was already given.
- The two together made the damage permanent: publishing again restored the status and found no ratings.

## Why the reference fix is right

- `fieldsOf` returns only what comes from the request. Nothing in it can change a column the cook did not send.
- A new recipe is a draft because the model says so (`defaultValue: 'draft'`), in one place.
- The status changes in one function, `publishRecipe`, which is the "step of its own" of the rule.
- The `Rating.destroy` is gone. Ratings are removed with their recipe by the database (`onDelete: 'CASCADE'`), which is the only case the rule allows.
- The rule "only published recipes are rated" still lives where it belongs, in `rateRecipe`.

## Compare with your fix

- Did you keep `status` in `fieldsOf` and write `recipe.status` back in the edit? The result is right, and `fieldsOf` still hands a status to every caller, waiting for the next one that forgets to override it.
- Did you keep the `Rating.destroy` behind `if (recipe.status === 'draft')`? Then an edit of a draft still deletes ratings. Can a draft have ratings? Not today. Code that deletes data "just in case" is worth removing rather than guarding.
- Did you accept a `status` field in the body of the edit? That changes the API: any client could publish, or unpublish, through an edit, around `publishRecipe` and its checks.
- Did you make the page publish the recipe again after each save? The ratings are still deleted, and the rule is still broken for every other client.

## Watch for next time

- A function shared by create and edit must contain only what is true for both. Defaults for new records belong to the creation, or to the model.
- Deleting data needs a rule that says so. "Belongs to" and "only for" are not instructions to delete.
- Read an update as a list of every column it writes, and ask of each one: did the user ask for this?
