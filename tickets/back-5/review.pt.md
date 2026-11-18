# Code review: RB-205, um filtro que tomou o lugar dos outros

Cada filtro era calculado certo. No último passo, um deles era usado no lugar dos demais. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- O `listRecipes` reúne as condições em um objeto `where`. O ingrediente não pode ser uma simples condição de coluna, porque os ingredientes moram em outra tabela, então os ids das receitas que casam são buscados antes.
- A consulta final era `where: ids ? { id: ids } : where`. Com ingrediente, a consulta recebia um objeto novo só com os ids; a categoria e a busca, que estavam em `where`, nunca chegavam ao banco.
- O comentário ao lado explica o engano: "os ids já foram escolhidos entre as receitas que casam". Eles foram escolhidos entre as receitas que têm o **ingrediente**. Ninguém tinha aplicado os outros filtros a eles.

## Por que a correção de referência está certa

- `where.id = ids` acrescenta os ids ao mesmo objeto das outras condições. O Sequelize liga as chaves de um `where` por E, que é o sentido de "todos os filtros informados".
- A consulta recebe sempre `where`. Não existe um segundo caminho que possa esquecer uma condição.
- Uma lista vazia de ids vira `id IN ()`, que não casa com nada: um ingrediente que nenhuma receita tem dá resposta vazia, com ou sem outros filtros.
- O filtro de favoritas, que também estreita `ids`, fica coberto pela mesma linha.

## Compare com a sua correção

- Você filtrou o resultado em JavaScript depois da consulta (`recipes.filter(...)` pela categoria)? Funciona para a categoria. A busca, que também lê a legenda da foto, teria que ser reescrita em JavaScript, e as duas versões vão se afastar. Deixe o banco aplicar todas as condições.
- Você espalhou os objetos (`{ ...where, id: ids }`)? Correto. Confira se o `Op.or` da busca sobrevive ao espalhamento: chaves que são símbolos são copiadas pelo spread, e vale a pena saber por quê.
- Você levou o ingrediente para uma junção com um `where` no nome do ingrediente? Pode dar certo; uma receita com dois ingredientes que casam ("egg" e "egg yolk") ainda precisa aparecer uma vez só.
- Você testou três filtros juntos, e a combinação com o **Only favorites**?

## Fique de olho da próxima vez

- Filtros que funcionam um por vez e falham juntos são um problema de combinação. Leia o lugar em que eles se encontram.
- Um `a ? x : y` entre duas versões de um filtro é um lugar onde uma delas pode se perder. Monte um objeto só e vá acrescentando.
- Teste filtros em pares. Aqui, os testes de um filtro só passavam todos.
