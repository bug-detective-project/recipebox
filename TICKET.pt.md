# RB-105: Receita que não existe aparece como receita vazia

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Média |
| Relator | Ingrid Solberg (Responsável pelo site) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Cliente (página da receita) |
| Rótulos | `página-da-receita`, `erros`, `fetch` |
| Sprint | RB Sprint 1 |
| Criado em | 04/03/2026 11:15 |

## Descrição

O boletim do mês passado tinha o link de uma receita que depois foi apagada. Quem clica no link cai em uma página de receita sem nada: sem título, "Main course · 0 min", uma etiqueta **Draft**, "1 serving", "No ingredients yet", "No steps yet". Os botões **Edit**, **Publish** e **Delete** estão todos lá.

Uma pessoa clicou em **Publish**, recebeu "That did not work" e me escreveu perguntando o que tinha quebrado. Nada: a receita simplesmente não existe.

A página deveria dizer isso. O app já tem uma página de "não encontrado" com um caminho de volta para a lista; um endereço sem sentido, como `/recipes/abc`, deveria cair nela também.

## Passos para reproduzir

1. Abra `http://localhost:5173/recipes/999`.

## Resultado esperado

"Recipe not found" e um link de volta para as receitas. Nada de página de receita: sem ingredientes, sem passos, sem botões.

## Resultado atual

Uma receita vazia, com todos os botões de uma receita de verdade.

## Critérios de aceite

- [ ] O endereço de uma receita que não existe (`/recipes/999`, `/recipes/abc`) mostra "Recipe not found" e o link de volta para a lista.
- [ ] O endereço de edição de uma receita que não existe (`/recipes/999/edit`) mostra o mesmo, e não um formulário vazio.
- [ ] Quando a API falha por outro motivo (um 500), a página diz que a receita não pôde ser carregada. Ela não diz "not found" nem mostra uma receita vazia.
- [ ] Uma receita que existe aparece como antes.

## Ambiente

- RecipeBox 1.0
- Qualquer navegador

## Atividade

**Ingrid Solberg** · 04/03/2026 11:40
> Conferi com o curl: `GET /api/recipes/999` responde 404 com `{"error":"Recipe not found"}`. Então o servidor diz com todas as letras. A página é que não está ouvindo.
