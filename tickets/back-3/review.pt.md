# Code review: RB-203, um sucesso que não fez nada

A exclusão funcionava para receitas que existem. Para as outras ela respondia a mesma coisa, porque nunca olhava o que o banco dizia. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- O `Recipe.destroy` não falha quando nenhuma linha casa. Ele resolve com o número de linhas removidas, e aqui esse número era jogado fora.
- A rota respondia 204 sempre que a função retornava, então "removi" e "não havia o que remover" eram iguais para quem chamava.
- As outras operações sobre uma receita carregam a receita antes e ganham um `NotFoundError` de graça. A exclusão era a única que não carregava nada.

## Por que a correção de referência está certa

- A contagem do `destroy` é o fato: 0 linhas quer dizer que a receita não estava lá, e a função lança `NotFoundError`, o mesmo erro que o resto da API usa, com a mesma mensagem.
- Uma consulta só. A receita não é carregada antes só para ser apagada.
- Um id que não é número inteiro nem chega ao banco: também é 404, como em `GET /api/recipes/abc`.
- A rota não mudou. Ela continua respondendo 204 quando a função retorna, e a função agora só retorna quando algo foi excluído.

## Compare com a sua correção

- Você chamou `loadRecipe(id)` e depois `destroy`? Está correto e é fácil de ler: são duas consultas em vez de uma, e entre elas outra requisição poderia apagar a mesma receita. Para um caderno de receitas, tudo bem; saiba que a contagem é a verdade mais barata.
- Você respondeu 404 na rota com `reply.status(404)`? Funciona. A rota passa a conhecer uma regra que as outras rotas deixam para as funções e para o tratador de erros, e a mensagem pode se afastar de "Recipe not found".
- Você respondeu 200 com `{ deleted: false }`? Um script que confere só o status continua vendo sucesso. O status é a parte que todo cliente lê.
- Você tratou a exclusão repetida como sucesso porque "a receita sumiu de qualquer jeito"? É um desenho defensável em algumas APIs. Esta responde 404 para receita inexistente em todo o resto, e o ticket pede o mesmo aqui.

## Fique de olho da próxima vez

- Uma função que muda dados costuma dizer quanto mudou. Leia o valor de retorno antes de decidir a resposta.
- Quando uma API tem uma convenção (404 para o que não existe), confira cada rota nova contra ela. A que destoa é encontrada por quem depende dela.
