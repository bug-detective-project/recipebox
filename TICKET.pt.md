# RB-204: Receitas sem foto somem da busca

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Bianca Moretti (Organizadora do clube) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (busca) |
| Rótulos | `api`, `busca`, `junção` |
| Sprint | RB Sprint 2 |
| Criado em | 11/03/2026 11:00 |

## Descrição

Busquei "pasta" e o caderno disse **0 recipes**. A **Garlic Butter Pasta** é a nossa receita mais feita; ela está ali quando eu limpo o campo de busca.

Depois de um tempo vi o padrão: a busca só mostra receitas que têm foto. A **Cheese Toastie** não tem: buscar "toastie" não acha nada. A **Lemon Tart** não tem: buscar "lemon" acha o frango assado, que tem lemon no título e tem foto, e não acha a torta.

Quase tudo o que o pessoal adiciona fica sem foto no começo, então quase nenhuma receita nova pode ser buscada. Sem busca, a lista mostra todas.

## Passos para reproduzir

No terminal do VS Code, com o app rodando:

```sh
curl 'http://localhost:3001/api/recipes?q=pasta'
curl 'http://localhost:3001/api/recipes?q=lemon'
```

Ou digite `pasta` no campo **Search** da lista.

## Resultado esperado

`q=pasta` responde a **Garlic Butter Pasta**. `q=lemon` responde a **Lemon Tart** e a **Roast Chicken with Lemon**. Uma receita é encontrada pelo título ou pela descrição, tenha foto ou não.

## Resultado atual

`q=pasta` responde `[]`. `q=lemon` responde só a **Roast Chicken with Lemon**.

## Critérios de aceite

- [ ] Uma busca encontra receitas sem foto pelo título e pela descrição.
- [ ] Uma busca lista juntas receitas com e sem foto, cada uma uma vez, por título.
- [ ] Uma receita criada sem foto é encontrada na hora.
- [ ] A busca continua lendo o que a foto mostra (a legenda): `q=bowl of oats` encontra a **Overnight Oats**.
- [ ] Uma busca continua respeitando o filtro de categoria.

## Ambiente

- RecipeBox 1.0
- Qualquer navegador; também com curl

## Atividade

**Ingrid Solberg** · 11/03/2026 11:26
> A busca também olha a legenda da foto, fui eu que coloquei isso mês passado ("a bowl of oats" acha a overnight oats). As fotos ficam em uma tabela só delas. Desconfio da minha junção.
