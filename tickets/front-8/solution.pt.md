# Solução: Desenhe a lista que foi calculada

**Causa raiz.** Em `client/src/components/IngredientList.tsx`, quando as porções são diferentes das da receita, cada ingrediente é procurado com `scaled.find((item) => (item.id = ingredient.id))`. O `=` sozinho atribui o id e o devolve, um valor verdadeiro, então o `find` sempre devolve o primeiro item ajustado.

## Passo a passo

1. **Reproduza.** Abra uma receita e aperte **+**: toda linha é o primeiro ingrediente.
2. **Ache de onde vêm as linhas.** O `IngredientList` desenha `shown`, montado com um `find` sobre `scaled`.
3. **Leia a condição do `find`.** `item.id = ingredient.id` é uma atribuição.
4. **Desenhe o próprio `scaled`.** Ele já tem um item por ingrediente, em ordem.

   ```tsx
   export function IngredientList({ ingredients, recipeServings, servings }: { ingredients: Ingredient[]; recipeServings: number; servings: number }) {
     const scaled = scaleIngredients(ingredients, recipeServings, servings);

     if (ingredients.length === 0) {
       return <p className="text-muted">No ingredients yet.</p>;
     }
     return (
       <ul className="flex list-disc flex-col gap-1 pl-5">
         {scaled.map((ingredient) => (
           <li key={ingredient.id} data-testid="ingredient">
             {describeIngredient(ingredient)}
           </li>
         ))}
       </ul>
     );
   }
   ```

A referência também adiciona um teste de regressão, `client/src/components/IngredientList.test.tsx`: a lista para as porções da receita, para mais e para menos, os ingredientes recebidos sem alteração, e os botões da página da receita.

Depois rode `npm test`, aperte **+** e **−** em uma receita e mova o card para **Em QA**.
