# RB-106: Passo a passo ilegível no celular

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
| Rótulos | `página-da-receita`, `passos`, `celular` |
| Sprint | RB Sprint 2 |
| Criado em | 09/03/2026 18:30 |

## Descrição

Ninguém cozinha com um notebook na bancada. A gente apoia o celular no pote de farinha, e no celular os passos de toda receita ficam cortados à direita: cada linha simplesmente acaba na borda da tela, no meio de uma frase. A página não rola para o lado, então não dá para chegar ao resto da linha de jeito nenhum.

Na quinta passada a **Lemon Tart** mandou metade da cozinha "Line a tart tin with the dough and bake it blind at" e mais nada. A gente chutou 180. Acertou, mas mesmo assim.

Os ingredientes estão certos, o título está certo. Só os passos. No notebook tudo parece normal.

## Passos para reproduzir

1. Abra a **Lemon Tart**.
2. Deixe a janela do navegador estreita como um celular (ou use a barra de dispositivos das ferramentas de desenvolvedor em 375px).
3. Leia os passos.

## Resultado esperado

O texto de cada passo quebra em quantas linhas precisar, dentro da tela, com o número à esquerda.

## Resultado atual

Cada passo é uma coluna de texto muito larga, cortada na borda direita da tela.

## Critérios de aceite

- [ ] Em uma tela de 375px de largura, cada passo aparece inteiro dentro da tela: nada cortado, e sem rolagem para o lado, nem da página nem da lista.
- [ ] Um passo longo quebra em mais linhas.
- [ ] O número de cada passo fica à esquerda do texto, e o texto mantém um tamanho legível (14px ou mais).
- [ ] Em tela larga os passos ficam como hoje.

## Ambiente

- RecipeBox 1.0
- Celulares (visto em Android e iPhone); no notebook está certo

## Atividade

**Leo Tanaka** · 09/03/2026 18:52
> Encolher a janela do notebook mostra a mesma coisa, então não é do celular em si. É da largura.
