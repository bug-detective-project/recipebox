# RB-208: Terminar as favoritas: funcionam na lista e não na página da receita

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | História |
| Status | A fazer |
| Prioridade | Média |
| Relator | Bianca Moretti (Organizadora do clube) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (favoritas) |
| Rótulos | `api`, `favoritas`, `inacabado` |
| Sprint | RB Sprint 2 |
| Criado em | 13/03/2026 10:30 |

## Descrição

As favoritas foram ao ar pela metade, e dá para notar.

Na lista, o coração de cada card funciona: eu clico, ele enche; clico de novo, ele esvazia. Na página de uma receita o coração está sempre vazio, mesmo em uma receita que a lista mostra como favorita. Se eu clico ali, a receita vira favorita de fato (a lista mostra), mas o coração da página continua vazio, então pela página não há como tirar a marca.

E o **Only favorites**, acima da lista, responde "The recipes could not be loaded."

A Ingrid diz que o lado do servidor nunca foi terminado: a parte da lista foi feita primeiro e o resto ficou com anotações no código. Por favor, termine.

## O que já existe

- A tabela `favorites` e o modelo dela (`server/src/models.ts`): uma linha por receita favorita.
- O `PUT /api/favorites/:recipeId` põe a marca e o `DELETE /api/favorites/:recipeId` tira. Os dois respondem 204, os dois podem ser repetidos sem problema, e os dois respondem 404 para uma receita que não existe.
- O `GET /api/recipes` responde `favorite: true` ou `false` para cada receita.
- A página está pronta: o coração da lista e o da página da receita, e a caixa **Only favorites**, que envia `favorites=true`.

## O que construir

1. O `GET /api/recipes/:id` responde o `favorite` verdadeiro da receita. Hoje ele sempre responde `false`. As outras respostas que levam uma receita inteira (a edição e a publicação) devem dizer o mesmo.
2. O `GET /api/recipes?favorites=true` responde só as favoritas, por título como o resto da lista, e funciona junto com os outros filtros (`q`, `category`, `ingredient`). Hoje ele responde `501`. `favorites=false`, assim como a falta de `favorites`, lista tudo.

As anotações deixadas no código (`TODO`) marcam os dois lugares.

## Critérios de aceite

- [ ] A receita diz se é favorita, e acompanha a marca sendo posta e tirada, exatamente como a lista.
- [ ] `favorites=true` lista só as favoritas, por título.
- [ ] `favorites=true` combina com `q`, `category` e `ingredient`: uma receita só é listada quando passa por todos os filtros informados.
- [ ] `favorites=false` e a falta de `favorites` listam todas as receitas.
- [ ] O `PUT` e o `DELETE /api/favorites/:recipeId` continuam funcionando como descrito acima.

## Ambiente

- RecipeBox 1.0
- Qualquer navegador; também com curl

## Atividade

**Ingrid Solberg** · 13/03/2026 10:52
> Para quem pegar isto: leia como a lista já sabe quais receitas são favoritas antes de escrever qualquer coisa nova. Quase tudo de que você precisa já existe.
