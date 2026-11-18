# Solução: Uma regra só para o tempo de preparo

**Causa raiz.** O `PUT /api/recipes/:id` valida o corpo com o `recipeUpdateBody` (`server/src/schemas.ts`), que troca o `prepTime` por `pattern: '^\d+ ?(min)?$'`. Esse padrão só aceita minutos, então o Fastify recusa `1h30` antes de o `parsePrepTime`, a função que lê todos os formatos, ser chamado. O `POST /api/recipes` usa o `recipeBody`, que não tem padrão.

## Passo a passo

1. **Reproduza com o curl.** O mesmo corpo é criado com 201 e recusado na edição com 400 e o padrão como mensagem.
2. **Compare os esquemas das duas rotas** em `server/src/routes/recipes.ts`: `recipeBody` e `recipeUpdateBody`.
3. **Use o mesmo esquema nas duas.**

   ```ts
   app.put<{ Params: Id; Body: RecipeInput }>('/api/recipes/:id', { schema: { body: recipeBody } }, async (request) => {
     const recipe = await updateRecipe(sequelize, Number(request.params.id), request.body);
     logChange(request, 'updated', recipe.id);
     return recipe;
   });
   ```

4. **Apague o `recipeUpdateBody` e o `MINUTES_PATTERN`** de `server/src/schemas.ts`, e o import nas rotas.

A referência também adiciona um teste de regressão, `server/src/prep-time-on-edit.test.ts`: cada formato aceito dá os mesmos minutos em uma criação e em uma edição, cada texto recusado recebe a mesma resposta nas duas, e uma receita de noventa minutos é salva de novo.

Depois rode `npm test`, repita o `curl` do ticket e mova o card para **Em QA**.
