# Solução: Uma regra que é consultada para a lista vazia

**Causa raiz.** A lista de ingredientes é validada com `rules: { minLength: { value: 1, … } }` no `useFieldArray` de `client/src/components/RecipeForm.tsx`. O React Hook Form só confere o `minLength` quando o campo tem valor, e um array vazio é um valor vazio: a regra é pulada justamente quando a lista não tem linhas.

## Passo a passo

1. **Reproduza.** Em **New recipe**, remova a única linha de ingrediente, preencha o resto e salve: a receita é criada.
2. **Ache a regra.** `useFieldArray({ control, name: 'ingredients', rules: { minLength: … } })`.
3. **Escreva uma regra que rode para a lista vazia.**

   ```ts
   const ingredients = useFieldArray({
     control,
     name: 'ingredients',
     // A rule of the whole list: its message is errors.ingredients.root.
     rules: { validate: (items) => items.length > 0 || 'Add at least one ingredient' },
   });
   ```

   O formulário já mostra `errors.ingredients.root.message`, e o `handleSubmit` não chama o `save` enquanto a regra falha.

A referência também adiciona um teste de regressão, `client/src/components/RecipeForm.ingredients.test.tsx`: uma receita nova sem ingredientes, uma receita salva com todas as linhas removidas, a mensagem sumindo depois que uma linha é adicionada, e uma receita com um ingrediente.

Depois rode `npm test`, repita os passos do ticket e mova o card para **Em QA**.
