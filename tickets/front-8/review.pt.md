# Code review: RB-108, um caractere e uma procura a mais

As quantidades ajustadas eram calculadas certo. A lista então procurava cada ingrediente de novo, e a procura sempre respondia o primeiro. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- `scaled.find((item) => (item.id = ingredient.id))` atribui em vez de comparar. Uma atribuição é uma expressão cujo valor é o que foi atribuído; um id é um número positivo, então o valor é verdadeiro e o `find` devolve o primeiro item, sempre.
- Nada reclamou. Uma atribuição é uma expressão válida, então o TypeScript aceita, e as regras de lint deste projeto também. As ferramentas conferem se o código pode rodar, e não se ele diz o que se queria dizer.
- O atalho "nada a calcular enquanto as porções são as da receita" pulava esse código justamente nas porções com que a página abre, e a página parecia certa até alguém apertar um botão.
- Há um segundo efeito: a atribuição sobrescrevia o id do primeiro item ajustado a cada passada.

## Por que a correção de referência está certa

- A procura sumiu. O `scaleIngredients` devolve um item por ingrediente, na mesma ordem, com a quantidade ajustada. É essa lista que deve ser desenhada: `scaled.map(...)`.
- O atalho sumiu também. Para as porções da receita o fator é 1 e as quantidades não mudam, então um caminho só serve a todos os casos. Código que só roda depois de um clique é código que só é testado depois de um clique.
- Menos código, e nada sobrando que possa escolher o item errado.

## Compare com a sua correção

- Você trocou `=` por `===`? A lista fica certa. Você manteve uma busca pela lista para cada linha da lista, e o caso especial das porções sem ajuste; os dois só existem um por causa do outro.
- Você pegou o item pelo índice (`scaled[index]`)? Também fica certo, e mostra que `shown` e `scaled` são a mesma lista.
- Você consertou no `scaleIngredients`? Essa função estava correta: os testes dela passam com o bug.
- Você conferiu abaixo das porções da receita, além de acima? O bug existia nas duas direções.

## Fique de olho da próxima vez

- Quando todos os itens de uma lista mostram o mesmo dado, procure uma busca que não tem como falhar: um `find` com condição sempre verdadeira, uma chave que é sempre a mesma.
- As ferramentas não pegaram este. Um `=` sozinho dentro de uma condição merece um segundo olhar na revisão, diga o linter o que disser.
- Antes de consertar uma linha, pergunte se a linha é necessária.
