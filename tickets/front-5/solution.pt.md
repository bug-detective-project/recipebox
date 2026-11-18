# Solução: Nem toda resposta é um sucesso

**Causa raiz.** O `fetchRecipe` em `client/src/api/recipes.ts` chama o `fetch` e nunca confere `response.ok`. Para um 404 ele lê o corpo do erro, espalha por cima do `EMPTY_RECIPE` e devolve isso como receita; a consulta dá certo e a página mostra uma receita vazia.

## Passo a passo

1. **Reproduza.** Abra `/recipes/999`: uma receita vazia. Na aba de rede, a requisição respondeu 404.
2. **Ache quem busca uma receita.** `useRecipe` → `fetchRecipe` → `fetch`, diferente de todas as outras chamadas do arquivo, que usam o `request`.
3. **Use o ajudante que sabe o que é um erro.**

   ```ts
   export function useRecipe(id: string | undefined) {
     return useQuery({
       queryKey: ['recipes', 'detail', id],
       queryFn: () => request<RecipeDetail>(`/api/recipes/${id}`),
       enabled: id !== undefined,
     });
   }
   ```

   Apague o `fetchRecipe`, o `EMPTY_RECIPE` e o import do `currentCook`. O `request` lança um `ApiError` com o status, e a `RecipePage` e a página de edição já mostram "Recipe not found" para um 404 e "The recipe could not be loaded" para o resto.

A referência também adiciona um teste de regressão, `client/src/pages/RecipePage.missing.test.tsx`: uma receita que não existe na página dela e na página de edição, uma resposta 500, e uma receita que existe.

Depois rode `npm test`, abra `/recipes/999` de novo e mova o card para **Em QA**.
