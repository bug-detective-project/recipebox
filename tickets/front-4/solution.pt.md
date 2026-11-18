# Solução: A edição avisa todas as cópias

**Causa raiz.** O `useUpdateRecipe` em `client/src/api/recipes.ts` invalida só a chave da página da receita (`['recipes', 'detail', id]`). As listas em cache (`['recipes', 'list', filters]`) continuam frescas por um minuto (`staleTime`), então a lista mostra a receita como era antes da edição.

## Passo a passo

1. **Reproduza olhando a aba de rede.** Depois de salvar, voltar para a lista não faz nenhuma requisição a `/api/recipes`.
2. **Compare as mutações.** `useCreateRecipe` e `useDeleteRecipe` invalidam `['recipes']`; `useUpdateRecipe` invalida uma receita só.
3. **Invalide todas as cópias.**

   ```ts
   export function useUpdateRecipe() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: ({ id, input }: { id: number; input: RecipeInput }) => request<RecipeDetail>(`/api/recipes/${id}`, { method: 'PUT', body: input }),
       onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
     });
   }
   ```

A referência também adiciona um teste de regressão, `client/src/api/recipes.cache.test.tsx`: a partir da lista, uma receita é editada e a lista é aberta de novo, com título novo e com tempo e categoria novos.

Depois rode `npm test`, repita os passos do ticket e mova o card para **Em QA**.
