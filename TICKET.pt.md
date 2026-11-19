# RB-207: Registrar quem alterou cada receita

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | História |
| Status | A fazer |
| Prioridade | Média |
| Relator | Ingrid Solberg (Responsável pelo site) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (registros) |
| Rótulos | `api`, `registros`, `auditoria` |
| Sprint | RB Sprint 2 |
| Criado em | 12/03/2026 14:00 |

## Descrição

Na segunda-feira a **Roast Chicken with Lemon** apareceu com os passos trocados por uma linha só, "ask Leo". O Leo diz que não foi ele. Fui ao registro (log) do servidor para descobrir quem salvou aquilo, e o registro consegue me dizer que houve um `PUT /api/recipes/4` às 21:14 e mais nada: nem quem, nem direito o quê.

O caderno não tem login, e não vamos criar um para cinco pessoas. Mas cada pessoa escolhe um nome no cabeçalho da página (**Cooking as**), e a página já envia esse nome em toda requisição, no cabeçalho `X-Cook`. O servidor é que nunca lê.

Quero uma linha no registro para cada alteração em uma receita, dizendo o que foi feito, em qual receita e por quem. Nada além disso: não quero receitas copiadas para o registro.

## O que já existe

- O servidor registra com o logger do Fastify: um objeto JSON por linha, no terminal onde o servidor roda. Cada requisição já ganha duas linhas (`incoming request` e `request completed`) com o identificador da requisição (`reqId`).
- Dentro de uma rota, `request.log` é o logger daquela requisição: o que ele escreve leva o mesmo `reqId`.
- O cliente envia `X-Cook` em toda requisição (`client/src/api/http.ts`).
- As rotas que alteram uma receita estão em `server/src/routes/recipes.ts`: criar, editar, publicar e excluir.

## O que construir

Depois de cada alteração em uma receita **que aconteceu**, escreva uma linha com o logger da requisição, no nível `info`, com exatamente estes quatro campos, além do que o logger acrescenta sozinho:

| Campo | Valor |
| --- | --- |
| `event` | `"recipe.changed"` |
| `action` | `"created"`, `"updated"`, `"published"` ou `"deleted"` |
| `recipeId` | o id da receita, um número |
| `cook` | o nome de quem cozinha, ou `"unknown"` |

O nome é o cabeçalho `X-Cook` sem os espaços em volta. Ele é um nome quando tem de 1 a 40 caracteres e só letras de A a Z (maiúsculas ou minúsculas), dígitos, espaços, pontos (`.`), apóstrofos (`'`) e hifens (`-`). Uma requisição sem o cabeçalho, ou com qualquer outra coisa nele, é de `unknown`: o que um cliente manda em um cabeçalho não pode ir para o registro do jeito que veio.

Exemplo (`level`, `time`, `pid`, `hostname` e `reqId` são do logger):

```json
{"level":30,"time":1773324840123,"pid":4242,"hostname":"kitchen","reqId":"req-7","event":"recipe.changed","action":"updated","recipeId":4,"cook":"Leo","msg":"recipe updated"}
```

## Critérios de aceite

- [ ] Criar, editar, publicar e excluir uma receita escrevem, cada um, uma linha com `event`, `action`, `recipeId` e `cook` como descrito, no nível `info` (30), com o `reqId` da requisição.
- [ ] O `cook` é o nome do cabeçalho `X-Cook` quando ele é um nome pela regra acima, e `unknown` caso contrário (sem cabeçalho, vazio, mais de 40 caracteres, outros caracteres).
- [ ] Uma alteração que não aconteceu (resposta 400, 404 ou 409) não escreve essa linha.
- [ ] Ler, avaliar e marcar favoritas não escrevem essa linha.
- [ ] A linha nunca leva o que a pessoa digitou: nem título, nem descrição, nem ingrediente, nem passo.

## Ambiente

- RecipeBox 1.0
- O registro é o que o servidor imprime no terminal do `npm run dev`

## Atividade

**Ingrid Solberg** · 12/03/2026 14:22
> Para deixar claro o que isto não é: não é um histórico das receitas e não vai para o banco. É uma linha no registro, para que da próxima vez eu possa procurar por `recipe.changed` e pelo id.
