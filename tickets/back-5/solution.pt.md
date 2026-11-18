# Solução: O ingrediente é uma condição a mais

**Causa raiz.** O `listRecipes` em `server/src/recipes.ts` roda a consulta com `where: ids ? { id: ids } : where`. Quando o filtro de ingrediente é usado, `ids` existe, e um objeto novo só com os ids toma o lugar do `where` que guarda a categoria e a busca.

## Passo a passo

1. **Reproduza.** `curl 'http://localhost:3001/api/recipes?ingredient=egg&category=dessert'` lista um café da manhã.
2. **Leia como as condições se encontram** no `listRecipes`: o `where` recebe a categoria e a busca; o `ids` recebe as receitas com o ingrediente (e as favoritas).
3. **Acrescente os ids ao mesmo `where`.**

   ```ts
   if (ids) {
     where.id = ids;
   }

   const recipes = await Recipe.findAll({
     where,
     include: [{ model: Photo, as: 'photo', required: false }],
     order: [
       ['title', 'ASC'],
       ['id', 'ASC'],
     ],
   });
   ```

A referência também adiciona um teste de regressão, `server/src/ingredient-with-filters.test.ts`: o ingrediente sozinho, com categoria, com busca, com os dois, e um ingrediente que nenhuma receita tem.

Depois rode `npm test`, repita o `curl` do ticket e mova o card para **Em QA**.
