# Code review: RB-204, a junção que filtrava

As condições da busca estavam certas. O jeito de juntar a tabela de fotos para respondê-las tirava metade do caderno antes. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- A busca lê uma coluna de outra tabela, a legenda da foto, então a consulta precisa juntar `photos`.
- O include era `required: Boolean(filters.q)`. Com busca, o Sequelize escrevia um INNER JOIN: só sobrevivem à junção as receitas com uma linha correspondente em `photos`.
- O raciocínio do comentário, "uma busca precisa da foto", confunde duas coisas: a consulta precisa da **tabela** de fotos para comparar legendas; uma receita não precisa de foto para ser encontrada pelo título.
- Sem busca a junção era um LEFT JOIN, então a lista simples nunca mostrava o problema.

## Por que a correção de referência está certa

- `required: false`, sempre: um LEFT JOIN mantém todas as receitas e dá NULL nas colunas da foto quando não há foto.
- O OU faz o resto. `NULL ILIKE '%pasta%'` não é verdadeiro, então uma receita sem foto só é encontrada pelo título ou pela descrição, que é exatamente o que se quer.
- Uma receita tem no máximo uma foto, então a junção não multiplica linhas: cada receita continua aparecendo uma vez.
- Mudou uma linha, no lugar que decidia quais linhas existem. As condições e a ordem não foram tocadas.

## Compare com a sua correção

- Você tirou o `$photo.caption$` da busca? As receitas sem foto voltaram, e a busca pela legenda, que o pessoal usa, sumiu. O ticket pede para manter.
- Você fez duas consultas (uma pelo texto, outra pela legenda) e juntou os resultados? Dá para acertar; confira duplicatas e a ordem por título. O banco faz isso em um comando só.
- Você acrescentou um segundo include, ou `subQuery: false`, até funcionar? Olhe o SQL (`logging: console.log` no `openDatabase` mostra): se ainda diz INNER JOIN, ainda faltam receitas.
- Você conferiu uma busca combinada com categoria? A junção não pode desfazer os outros filtros.

## Fique de olho da próxima vez

- Uma junção pode remover linhas. Quando somem resultados, pergunte de cada junção se ela é INNER ou LEFT antes de ler o WHERE.
- Com um ORM, leia o SQL que ele escreve pelo menos uma vez por consulta. O `required`, ou um `where` dentro de um `include`, muda o tipo de junção sem que a palavra "join" apareça no seu código.
- Teste uma busca com dados em que falta a parte opcional: a receita sem foto, o usuário sem endereço.
