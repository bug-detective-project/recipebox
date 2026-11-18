# Solução: Uma linha por alteração, com quem alterou

**O que faltava.** As rotas que alteram uma receita não escreviam nada próprio no registro, e o servidor nunca lia o cabeçalho `X-Cook` que o cliente envia. A referência acrescenta uma função que lê o nome com segurança e uma linha de registro depois de cada alteração bem-sucedida.

## Passo a passo

1. **Leia o nome do cabeçalho.** Arquivo novo `server/src/cook.ts`:

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

2. **Escreva a linha com o logger da requisição.** Em `server/src/routes/recipes.ts`:

   ```ts
   type Action = 'created' | 'updated' | 'published' | 'deleted';

   function logChange(request: FastifyRequest, action: Action, recipeId: number): void {
     request.log.info({ event: 'recipe.changed', action, recipeId, cook: cookOf(request) }, `recipe ${action}`);
   }
   ```

3. **Chame a função depois de cada alteração dar certo.**

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

   O mesmo na edição (`'updated'`) e na publicação (`'published'`). Quando a função anterior lança erro, o `logChange` não é alcançado.

A referência também adiciona um teste, `server/src/change-log.test.ts`, que lê o que o servidor registrou: as quatro ações com o nome de quem alterou, o nível e o `reqId`, nomes aceitos e não aceitos, alterações que não aconteceram, requisições que não são alterações, e uma linha sem o texto da receita.

Depois rode `npm test`, salve uma receita pela página com o `npm run dev` rodando, leia a linha no terminal e mova o card para **Em QA**.
