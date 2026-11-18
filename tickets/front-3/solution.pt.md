# Solução: O endereço é o estado

**Causa raiz.** O `useFilters` em `client/src/filters.ts` guarda os filtros da lista em `useState`. O estado morre quando a `RecipesPage` é desmontada (abrir uma receita, recarregar), e o endereço nunca leva os filtros.

## Passo a passo

1. **Reproduza.** Busque `tart`, abra a receita, volte: o campo de busca está vazio e o endereço sempre foi `/`.
2. **Ache onde os filtros moram.** A `RecipesPage` chama `useFilters()`; o hook é um `useState`.
3. **Guarde os filtros na query string.**

   ```ts
   export function useFilters(): { filters: RecipeFilters; change: (changes: Partial<RecipeFilters>) => void } {
     const [params, setParams] = useSearchParams();
     const filters: RecipeFilters = {
       q: params.get('q') ?? '',
       category: CATEGORIES.find((category) => category === params.get('category')) ?? '',
       ingredient: params.get('ingredient') ?? '',
       favorites: params.get('favorites') === 'true',
     };

     const change = (changes: Partial<RecipeFilters>) => {
       const next = new URLSearchParams();
       for (const [key, value] of Object.entries({ ...filters, ...changes })) {
         if (value !== '' && value !== false) {
           next.set(key, String(value));
         }
       }
       // Typing in the search box is one visit to the list, not one per letter.
       setParams(next, { replace: true });
     };

     return { filters, change };
   }
   ```

A referência também adiciona um teste de regressão, `client/src/filters.test.tsx`: cada filtro escrito no endereço, um filtro limpo saindo dele, e uma lista que começa pelos filtros do endereço.

Depois rode `npm test`, repita os passos do ticket e mova o card para **Em QA**.
