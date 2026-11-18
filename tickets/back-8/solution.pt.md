# Solução: As favoritas, terminadas

**O que faltava.** Em `server/src/recipes.ts`, o `getRecipe` respondia `favorite: false` para toda receita, e o `listRecipes` não filtrava por favoritas; a rota em `server/src/routes/recipes.ts` respondia 501 para `favorites=true`. A tabela, o modelo, as duas rotas de `/api/favorites` e a marca da lista já funcionavam.

## Passo a passo

1. **Ache os lugares inacabados.** Duas anotações `TODO`: no `getRecipe` e na rota da lista.
2. **Responda a marca verdadeira de uma receita.** No `getRecipe`, use o ajudante que a lista usa:

   ```ts
   return {
     ...summaryOf(recipe, rating, (await favoriteIds()).has(recipe.id)),
     ingredients: recipe.ingredients!.map(({ id: ingredientId, name, quantity, unit }) => ({ id: ingredientId, name, quantity, unit })),
     steps: recipe.steps!.map(({ id: stepId, text }) => ({ id: stepId, text })),
   };
   ```

3. **Filtre a lista.** No `listRecipes`, depois do filtro de ingrediente e antes de o `ids` entrar no `where`:

   ```ts
   if (filters.favorites) {
     ids = (ids ?? [...favorites]).filter((id) => favorites.has(id));
   }
   if (ids) {
     where.id = ids;
   }
   ```

4. **Tire o 501** da rota, para a requisição chegar ao `listRecipes`:

   ```ts
   app.get<{ Querystring: ListFilters }>('/api/recipes', { schema: { querystring: listQuery } }, (request) => {
     return listRecipes(request.query);
   });
   ```

A referência também adiciona um teste, `server/src/favorites.test.ts`: a marca na receita acompanhando o `PUT` e o `DELETE`, tirar uma marca que não existe, uma receita que não existe, e o filtro sozinho e junto com o filtro de ingrediente.

Depois rode `npm test`, experimente o coração na página de uma receita e o **Only favorites** na lista, e mova o card para **Em QA**.
