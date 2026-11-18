# Solução: Uma edição muda o que a pessoa digitou, e mais nada

**Causa raiz.** Em `server/src/recipes.ts`, o `fieldsOf` devolve `status: 'draft'` entre as colunas de uma receita, e o `updateRecipe` grava essas colunas; toda edição transforma a receita em rascunho. O `updateRecipe` depois roda `Rating.destroy` para a receita, o que apaga as avaliações dela.

## Passo a passo

1. **Reproduza.** O `PUT` do ticket responde `"status": "draft"` e uma avaliação com `count: 0`.
2. **Liste o que a edição grava.** `recipe.update(fields)` com os campos do `fieldsOf`, as partes, e um `Rating.destroy`.
3. **Tire o status do `fieldsOf`.**

   ```ts
   return {
     title: input.title.trim(),
     description: (input.description ?? '').trim(),
     category: input.category,
     servings: input.servings,
     prepMinutes,
   };
   ```

   Uma receita nova continua sendo rascunho: o modelo tem `defaultValue: 'draft'`.

4. **Remova a exclusão das avaliações** do `updateRecipe`.

   ```ts
   await sequelize.transaction(async (transaction) => {
     await recipe.update(fields, { transaction });
     await writeParts(recipe.id, input, transaction);
   });
   ```

A referência também adiciona um teste de regressão, `server/src/edit-published.test.ts`: uma receita publicada editada mantém o status e as avaliações e pode ser avaliada de novo, um rascunho continua rascunho, e uma receita nova é rascunho.

Depois rode `npm run db:reset` (para ter de volta as avaliações de exemplo), `npm test`, repita o `curl` do ticket e mova o card para **Em QA**.
