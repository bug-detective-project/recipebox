# Code review: RB-202, um número que era um texto

O sintoma estava na página e a causa, duas camadas abaixo, em como o servidor guarda e confere um campo. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- A coluna `servings` foi declarada `DataTypes.STRING(10)`, e o esquema do corpo aceitava `type: 'string'`. O banco guardava texto e a API respondia texto: `"servings": "4"`.
- Os tipos do TypeScript diziam `number` em todo lugar. Eles descrevem o que o código espera, e nada os confere contra o que o banco devolve na hora de rodar.
- A página fazia conta com o que recebia. `"4" - 1` é 3, porque o `-` converte; `"4" + 1` é `"41"`, porque o `+` junta textos. Por isso só o **+** a partir das porções da própria receita parecia quebrado.
- Com coluna de texto e esquema de texto, nada recusava `"many"` também.

## Por que a correção de referência está certa

- A coluna é `DataTypes.INTEGER`, então o valor é número onde fica guardado e número quando é lido.
- O esquema é `{ type: 'integer', minimum: 1, maximum: 100 }`: a requisição é recusada na porta, com o campo indicado, antes de qualquer coisa ser salva.
- A correção está na origem. Todo leitor da API recebe um número: esta página, a lista e qualquer cliente escrito depois.
- A página não foi tocada. Ela estava certa em presumir o que a API prometia.

## Compare com a sua correção

- Você escreveu `Number(recipe.servings)` na página? Esta tela está consertada. A API continua respondendo texto, continua guardando `"many"`, e a próxima tela que ler `servings` terá o mesmo bug.
- Você converteu no `summaryOf` com `Number(...)` e deixou a coluna como texto? A resposta agora é número, mas `"many"` vira `NaN`, que o JSON escreve como `null`, a menos que o esquema recuse antes. Confira o que responde uma receita salva antes da sua correção.
- Você consertou o esquema e não o modelo, ou o modelo e não o esquema? Cada um sozinho deixa uma porta aberta: texto no banco, ou qualquer coisa aceita.
- Você esqueceu do `npm run db:reset`? O modelo mudou e a tabela não. Os seus testes passam, porque criam as próprias tabelas, enquanto o app continua lendo uma coluna de texto.

## Fique de olho da próxima vez

- Quando um valor está errado na tela, siga o valor de trás para a frente até onde ele fica guardado, antes de mexer no lugar onde ele aparece.
- Um tipo do TypeScript em um dado que vem de fora (um banco, uma requisição) é uma esperança até que algo o confira na hora de rodar. Aqui, esse algo é o tipo da coluna e o esquema.
- O `+` com um texto de qualquer lado junta. Dos operadores aritméticos, é ele que esconde este erro.
