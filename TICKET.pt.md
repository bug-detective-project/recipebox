# RB-107: Estrelas de avaliação não funcionam pelo teclado

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Bianca Moretti (Organizadora do clube) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Cliente (avaliação) |
| Rótulos | `avaliação`, `teclado`, `a11y` |
| Sprint | RB Sprint 2 |
| Criado em | 10/03/2026 09:45 |

## Descrição

Uma das nossas sócias mais antigas, a Dona Irene, usa o caderno só com o teclado: um tremor torna o mouse difícil para ela. Ela consegue abrir receitas, marcar favoritas, editar, tudo. O que ela não consegue é avaliar uma receita. O Tab vai dos botões de porções direto para o fim da página: as cinco estrelas nunca recebem o foco, então não há o que apertar.

O leitor de tela dela também não fala das estrelas. Para ele, "Did you cook it?" é um título sem nada embaixo.

Ela já fez mais receitas daqui do que qualquer pessoa do clube. As avaliações dela são as que eu mais quero.

## Passos para reproduzir

1. Abra uma receita publicada, por exemplo a **Hummus**.
2. Aperte **Tab** até o fim da página, olhando para onde o foco vai.

## Resultado esperado

O foco chega às estrelas. Com uma estrela em foco, **Espaço** dá aquela nota, e aparece "Thanks for rating!". Um leitor de tela diz qual é a estrela: "1 star", "2 stars" … "5 stars".

## Resultado atual

O foco nunca chega às estrelas. Elas só funcionam com clique do mouse.

## Critérios de aceite

- [ ] Cada uma das cinco estrelas é um controle a que o teclado chega com Tab: botões, ou um grupo de botões de opção (radio).
- [ ] Cada estrela tem um nome acessível: exatamente `1 star`, `2 stars`, `3 stars`, `4 stars` e `5 stars`.
- [ ] Com uma estrela em foco, Espaço envia aquela nota, e a avaliação mostrada na página é atualizada.
- [ ] A estrela em foco mostra um anel de foco visível.
- [ ] O clique do mouse continua avaliando, e as estrelas não podem ser usadas enquanto uma avaliação está sendo enviada.

## Ambiente

- RecipeBox 1.0
- Firefox com o leitor de tela NVDA; só teclado

## Atividade

**Ingrid Solberg** · 10/03/2026 10:10
> O coração das favoritas e os botões de porções recebem o foco sem problema nenhum. Eu olharia do que eles são feitos e do que as estrelas são feitas.
