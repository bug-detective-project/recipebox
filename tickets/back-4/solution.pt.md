# Solução: Uma junção que mantém todas as receitas

**Causa raiz.** O `listRecipes` em `server/src/recipes.ts` junta as fotos com `include: [{ model: Photo, as: 'photo', required: Boolean(filters.q) }]`. Com busca o `required` é verdadeiro, o Sequelize escreve um INNER JOIN, e toda receita sem linha em `photos` fica de fora antes de as condições da busca serem aplicadas.

## Passo a passo

1. **Reproduza.** `curl 'http://localhost:3001/api/recipes?q=pasta'` responde `[]`.
2. **Veja o padrão.** Só receitas com foto são encontradas.
3. **Leia o include** da consulta no `listRecipes`: o `required` depende de `filters.q`.
4. **Faça a junção ser LEFT JOIN, sempre.**

   ```ts
   const recipes = await Recipe.findAll({
     where,
     // A recipe without a photo is still a recipe: the join must not leave it out.
     include: [{ model: Photo, as: 'photo', required: false }],
     order: [
       ['title', 'ASC'],
       ['id', 'ASC'],
     ],
   });
   ```

   A condição em `$photo.caption$` continua no `Op.or`: para uma receita sem foto ela simplesmente não é verdadeira.

A referência também adiciona um teste de regressão, `server/src/search-without-photo.test.ts`: receitas sem foto encontradas pelo título e pela descrição, resultados misturados, uma receita recém-criada, a legenda ainda buscada, e a categoria mantida.

Depois rode `npm test`, repita o `curl` do ticket e mova o card para **Em QA**.
