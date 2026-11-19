# RB-205: Busca por ingrediente ignora o filtro de categoria

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Média |
| Relator | Bianca Moretti (Organizadora do clube) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (busca) |
| Rótulos | `api`, `filtros`, `ingrediente` |
| Sprint | RB Sprint 2 |
| Criado em | 11/03/2026 15:45 |

## Descrição

Tínhamos uma bandeja de ovos para gastar e eu queria uma sobremesa. Escolhi **Dessert** na categoria, digitei `egg` em **Ingredient**, e a lista me deu a **Banana Pancakes**, que é café da manhã, ao lado das três sobremesas.

Não é só a categoria. Com `chicken` em **Search** e `garlic` em **Ingredient**, recebo todas as receitas com alho, inclusive o hummus.

Cada filtro funciona sozinho. A categoria sozinha está certa, a busca sozinha está certa, o ingrediente sozinho está certo. Basta preencher o ingrediente para os outros filtros pararem de contar.

## Passos para reproduzir

No terminal do VS Code, com o app rodando:

```sh
curl 'http://localhost:3001/api/recipes?ingredient=egg&category=dessert'
curl 'http://localhost:3001/api/recipes?ingredient=garlic&q=chicken'
```

Ou na lista: escolha a categoria **Dessert** e digite `egg` em **Ingredient**.

## Resultado esperado

A primeira requisição responde as três sobremesas com ovo: **Chocolate Mug Cake**, **Egg Custard** e **Lemon Tart**. A segunda responde só a **Roast Chicken with Lemon**. Uma receita é listada quando passa por todos os filtros informados.

## Resultado atual

A primeira requisição responde também a **Banana Pancakes**. A segunda responde todas as receitas com alho.

## Critérios de aceite

- [ ] O filtro de ingrediente funciona junto com a categoria, com a busca e com o **Only favorites**, em qualquer combinação: uma receita só é listada quando passa por todos.
- [ ] Um ingrediente que nenhuma receita tem dá lista vazia, quaisquer que sejam os outros filtros.
- [ ] Cada filtro sozinho funciona como hoje.

## Ambiente

- RecipeBox 1.0
- Qualquer navegador; também com curl

## Atividade

**Bianca Moretti** · 11/03/2026 16:03
> Detalhe curioso: com o ingrediente preenchido, posso escolher a categoria que eu quiser e a lista nem se mexe.
