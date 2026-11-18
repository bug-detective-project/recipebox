# RB-108: Lista de ingredientes repete o primeiro item

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Leo Tanaka (Cozinheiro voluntário) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Cliente (página da receita) |
| Rótulos | `página-da-receita`, `ingredientes`, `porções` |
| Sprint | RB Sprint 2 |
| Criado em | 10/03/2026 19:20 |

## Descrição

Na quinta éramos onze em vez de oito, então abri a **Lemon Tart** e apertei o **+** das porções. A lista inteira de ingredientes virou a mesma linha, cinco vezes:

- 281.25 g flour
- 281.25 g flour
- 281.25 g flour
- 281.25 g flour
- 281.25 g flour

Sem manteiga, sem ovos, sem açúcar, sem limões. Apertar o **−** para voltar a 8 porções traz a lista certa de volta. Descer abaixo de 8 quebra do mesmo jeito.

Ou seja, a receita está certa enquanto ninguém muda as porções, que é justamente para o que os botões existem.

## Passos para reproduzir

1. Abra a **Banana Pancakes** (4 porções, 5 ingredientes).
2. Clique no **+** ao lado das porções.

## Resultado esperado

Cinco linhas, uma por ingrediente, cada uma com a sua quantidade para 5 porções: 2.5 ripe banana, 2.5 egg, 250 g flour, 312.5 ml milk, 1.25 tbsp butter.

## Resultado atual

Cinco linhas, todas "2.5 ripe banana".

## Critérios de aceite

- [ ] Para qualquer número de porções, a lista tem uma linha por ingrediente, na ordem da receita, cada uma com o seu nome, a sua unidade e a sua quantidade ajustada.
- [ ] Subir e depois voltar às porções da receita mostra a lista original.
- [ ] O mesmo vale para uma receita recém-criada.

## Ambiente

- RecipeBox 1.0
- Qualquer navegador

## Atividade

**Leo Tanaka** · 10/03/2026 19:41
> A primeira linha está sempre certa, também depois do ajuste: 281.25 g de farinha é o certo para 9 porções. As outras linhas é que copiam a primeira.
