# Solução: O formulário é a lista

**Causa raiz.** O `inputOf` em `client/src/components/RecipeForm.tsx` monta os `ingredients` da requisição a partir dos ingredientes da receita salva, posição por posição, e só usa a linha do formulário quando o formulário tem linha naquela posição. Depois de uma remoção o formulário tem menos linhas, e as linhas salvas preenchem o fim da lista.

## Passo a passo

1. **Veja na requisição.** Abra a aba de rede do navegador, remova o último ingrediente e salve: o `PUT /api/recipes/1` já leva cinco ingredientes.
2. **Ache quem monta a requisição.** O `handleSubmit` chama `save(inputOf(values, editing))`. O `inputOf` é o único lugar em que `editing.ingredients` encontra o formulário.
3. **Envie a lista do formulário.**

   ```ts
   function inputOf(values: RecipeFormValues): RecipeInput {
     return {
       // …
       ingredients: values.ingredients,
       steps: values.steps.map((step) => step.text),
     };
   }
   ```

   e, no envio, `await save(inputOf(values));`.

A referência também adiciona um teste de regressão, `client/src/components/RecipeForm.remove.test.tsx`: a última linha removida, uma linha do meio removida, duas linhas removidas, e uma remoção seguida de uma linha nova.

Depois rode `npm test`, repita os passos do ticket e mova o card para **Em QA**.
