# RB-103: Busca some ao abrir uma receita e voltar

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Média |
| Relator | Bianca Moretti (Organizadora do clube) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Cliente (lista de receitas) |
| Rótulos | `lista`, `busca`, `url` |
| Sprint | RB Sprint 1 |
| Criado em | 03/03/2026 10:05 |

## Descrição

Nas noites do clube eu busco no caderno o que vamos cozinhar, digamos "lemon", e abro as receitas uma por uma. Toda vez que aperto o **Voltar** do navegador, a lista está inteira de novo: o campo de busca fica vazio e eu preciso digitar "lemon" mais uma vez.

O mesmo acontece com a categoria, o ingrediente e o **Only favorites**: recarregar a página esquece todos.

E eu não consigo mandar para ninguém o link de uma busca. O que quer que eu filtre, o endereço continua `http://localhost:5173/`. Eu queria mandar para o clube "todas as sobremesas com ovo" e tive que mandar uma captura de tela.

## Passos para reproduzir

1. Abra a lista e digite `tart` em **Search**. Sobra uma receita, a **Lemon Tart**.
2. Olhe a barra de endereço: nada mudou.
3. Abra a **Lemon Tart** e aperte o **Voltar** do navegador.

## Resultado esperado

A lista volta com `tart` no campo de busca e só a **Lemon Tart**. O endereço mostra os filtros (por exemplo `/?q=tart`), e abrir esse endereço em qualquer lugar dá a mesma lista.

## Resultado atual

A lista volta inteira, com o campo de busca vazio. O endereço nunca mostra os filtros.

## Critérios de aceite

- [ ] A busca é escrita no endereço como `?q=…` enquanto a pessoa digita, e um filtro limpo sai do endereço.
- [ ] Ir a uma receita e voltar, e recarregar a página, mantêm os filtros e a lista.
- [ ] Abrir um endereço com filtros (`/?q=lemon&category=dessert`) mostra aquela lista, com os campos já preenchidos.
- [ ] A categoria (`category`), o ingrediente (`ingredient`) e o **Only favorites** (`favorites=true`) também ficam no endereço.

## Ambiente

- RecipeBox 1.0
- Chrome e Safari

## Atividade

**Bianca Moretti** · 03/03/2026 10:20
> A lista em si filtra direitinho enquanto eu fico nela. É só que a página não lembra de nada.
