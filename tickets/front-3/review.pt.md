# Code review: RB-103, o endereço é o estado

A lista filtrava certo. O errado era onde os filtros moravam: na memória de um componente, que é jogada fora sempre que a pessoa sai da página. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- O `useFilters` guardava os quatro filtros em `useState`. Esse estado pertence à `RecipesPage` enquanto ela está na tela.
- Abrir uma receita desmonta a lista. Voltar monta uma nova, com estado novo e vazio. Recarregar faz o mesmo.
- O endereço nunca mudava, então não havia o que copiar, favoritar ou enviar.

## Por que a correção de referência está certa

- Os filtros são lidos da query string com `useSearchParams` e escritos de volta nela. O endereço é o único lugar onde eles moram, então Voltar, Avançar, recarregar e um link colado mostram a mesma lista sem código a mais.
- O `change` escreve com `{ replace: true }`: digitar "lemon" é uma visita à lista, e não cinco entradas no histórico.
- Valores vazios ficam de fora, então o endereço da lista sem filtro continua sendo `/`.
- O que vem do endereço é conferido: uma categoria que não existe é tratada como nenhuma categoria, em vez de ir para a API.
- A `RecipesPage` não mudou. Ela pedia `filters` e `change` a um hook, e continua pedindo.

## Compare com a sua correção

- Você manteve o `useState` e copiou para o endereço em um efeito? Agora são duas fontes e um instante em que elas discordam, e um endereço aberto direto precisa ser lido de volta para o estado à mão.
- Você salvou os filtros no `localStorage`? Voltar e recarregar funcionam, mas um link continua não funcionando, e os filtros acompanham a pessoa em visitas em que ninguém os quer.
- Você criou uma entrada no histórico a cada tecla? O Voltar passa então por "lemo", "lem", "le" antes de sair da lista.
- Você tratou só o `q`? O ticket pede os quatro filtros.

## Fique de olho da próxima vez

- Se recarregar, o botão Voltar ou um link compartilhado devem mostrar a mesma coisa, essa coisa pertence ao endereço.
- Estado em componente é para o que pode ser esquecido quando o componente some: um menu aberto, um hover, um rascunho ainda não enviado.
