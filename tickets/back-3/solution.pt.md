# Solução: A exclusão diz o que aconteceu

**Causa raiz.** O `deleteRecipe` em `server/src/recipes.ts` chama `Recipe.destroy` e ignora o número de linhas removidas. A rota responde 204 sempre que a função retorna, então uma receita que não existe é "excluída" com sucesso.

## Passo a passo

1. **Reproduza.** `curl -i -X DELETE http://localhost:3001/api/recipes/999` responde 204.
2. **Leia a função.** O `Recipe.destroy` resolve com uma contagem; o código não a guarda.
3. **Use a contagem.**

   ```ts
   export async function deleteRecipe(id: number): Promise<void> {
     const deleted = Number.isInteger(id) ? await Recipe.destroy({ where: { id } }) : 0;
     if (deleted === 0) {
       throw new NotFoundError('Recipe not found');
     }
   }
   ```

   O tratador de erros de `server/src/app.ts` responde um `NotFoundError` com 404 e `{ "error": "Recipe not found" }`.

A referência também adiciona um teste de regressão, `server/src/delete-missing.test.ts`: um id que nunca existiu, uma segunda exclusão da mesma receita, ids que não são números inteiros, e uma receita que existe.

Depois rode `npm test`, repita o `curl` do ticket e mova o card para **Em QA**.
