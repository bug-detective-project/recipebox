# Code review: RB-106, uma largura que só cabe em algumas telas

A lista de passos foi escrita para uma largura e conferida em uma largura. Um celular é outra. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- O texto de um passo tinha largura fixa, `w-[38rem]` (608px), e `shrink-0`, que proíbe um item flex de encolher. A linha tinha 608px mais o número, em qualquer tela.
- A lista tinha `overflow-x-hidden`. Em tela estreita a linha saía para fora, e a lista cortava sem barra de rolagem.
- No notebook a linha cabe, então nada parecia errado onde o código foi escrito.

## Por que a correção de referência está certa

- O parágrafo é `min-w-0 flex-1`: ele ocupa a largura que sobra depois do número, em qualquer tela. O `min-w-0` importa: um item flex não fica mais estreito que o seu conteúdo a menos que alguém diga que pode.
- O `break-words` quebra uma palavra maior que a linha (um endereço comprido colado em um passo) em vez de deixá-la sair para fora.
- O `overflow-x-hidden` sumiu. Ele não consertava um transbordamento; escondia. Sem ele, um transbordamento futuro aparece como uma barra de rolagem que alguém vai notar.
- Não foi preciso ponto de quebra. O layout não tem tamanho de tela dentro dele, então não há tamanho em que ele quebre.

## Compare com a sua correção

- Você adicionou um ponto de quebra, como `w-full md:w-[38rem]`? Os celulares estão consertados. Confira um tablet, ou uma janela de notebook entre os dois tamanhos: uma largura fixa continua esperando ali. Se a ideia era um comprimento de linha confortável em tela larga, `max-w-prose` dá isso sem nunca ficar mais largo que a tela.
- Você só tirou o `overflow-x-hidden`? Agora dá para chegar ao texto, rolando para o lado a cada linha. O ticket pede que não haja rolagem para o lado.
- Você diminuiu o texto no celular? Cabem mais palavras por linha e ele continua sem quebrar; e letra pequena é o contrário do que uma cozinha precisa.
- Você mexeu no contêiner da página em vez da lista? Quem tinha largura fixa era a lista.

## Fique de olho da próxima vez

- Uma largura fixa é uma aposta na tela. Prefira "ocupe o que houver" (`flex-1`, `w-full`), com um `max-w-*` quando quiser um limite.
- `overflow: hidden` em um problema de layout tira a evidência, e não o problema.
- Confira uma tela nova em 375px, o celular mais estreito que atendemos, antes de dar por pronta. Leva dez segundos nas ferramentas de desenvolvedor.
