# Solução: As porções são número onde ficam guardadas

**Causa raiz.** A coluna `servings` é declarada `DataTypes.STRING(10)` em `server/src/models.ts`, e o `recipeBody` em `server/src/schemas.ts` aceita `servings` como `type: 'string'`. A API guarda e responde as porções como texto; na página, `"4" + 1` é `"41"`.

## Passo a passo

1. **Olhe a resposta.** `curl http://localhost:3001/api/recipes/1` mostra `"servings":"4"`.
2. **Siga o valor para trás.** O `summaryOf` copia `recipe.servings` do modelo; o modelo declara uma coluna de texto.
3. **Guarde um número.** Em `server/src/models.ts`:

   ```ts
   servings: { type: DataTypes.INTEGER, allowNull: false },
   ```

4. **Aceite só número.** Em `server/src/schemas.ts`:

   ```ts
   servings: { type: 'integer', minimum: 1, maximum: 100 },
   ```

5. **Crie a tabela de novo.** O `npm run db:reset` monta as tabelas a partir dos modelos; sem ele o seu banco continua com a coluna de texto.

A referência também adiciona um teste de regressão, `server/src/servings-number.test.ts`: as porções são número na lista e na receita, depois de uma criação e depois de uma edição, e valores que não são um número inteiro de 1 a 100 são recusados.

Depois rode `npm test`, aperte o **+** em uma receita e mova o card para **Em QA**.
