# Solution: One line per change, with the cook

**What was missing.** The routes that change a recipe wrote nothing of their own to the log, and the server never read the `X-Cook` header the client sends. The reference adds a function that reads the cook safely and a log line after each successful change.

## Step by step

1. **Read the cook from the header.** New file `server/src/cook.ts`:

   ```ts
   import type { FastifyRequest } from 'fastify';

   /** A name the cookbook accepts for a cook: letters, digits, spaces, dots, apostrophes and dashes; 1 to 40. */
   const COOK_NAME = /^[A-Za-z0-9 .'-]{1,40}$/;

   export const UNKNOWN_COOK = 'unknown';

   export function cookOf(request: FastifyRequest): string {
     const header = request.headers['x-cook'];
     const name = typeof header === 'string' ? header.trim() : '';
     return COOK_NAME.test(name) ? name : UNKNOWN_COOK;
   }
   ```

2. **Write the line with the logger of the request.** In `server/src/routes/recipes.ts`:

   ```ts
   type Action = 'created' | 'updated' | 'published' | 'deleted';

   function logChange(request: FastifyRequest, action: Action, recipeId: number): void {
     request.log.info({ event: 'recipe.changed', action, recipeId, cook: cookOf(request) }, `recipe ${action}`);
   }
   ```

3. **Call it after each change succeeded.**

   ```ts
   app.post<{ Body: RecipeInput }>('/api/recipes', { schema: { body: recipeBody } }, async (request, reply) => {
     const recipe = await createRecipe(sequelize, request.body);
     logChange(request, 'created', recipe.id);
     return reply.status(201).send(recipe);
   });

   app.delete<{ Params: Id }>('/api/recipes/:id', async (request, reply) => {
     const id = Number(request.params.id);
     await deleteRecipe(id);
     logChange(request, 'deleted', id);
     return reply.status(204).send();
   });
   ```

   The same in the edit (`'updated'`) and in the publish (`'published'`). When the function before it throws, `logChange` is not reached.

The reference also adds a test, `server/src/change-log.test.ts`, which reads what the server logged: the four actions with their cook, the level and the `reqId`, names that are and are not accepted, changes that did not happen, requests that are not changes, and a line without the text of the recipe.

Then run `npm test`, save a recipe on the page with `npm run dev` running and read the line in the terminal, and move the card to **In QA**.
