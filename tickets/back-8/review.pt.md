# Code review: RB-208, terminar o que outra pessoa começou

Este ticket era trabalho inacabado, e não um bug. A maior parte da funcionalidade existia; o serviço era achar as duas peças que faltavam e construí-las do jeito que o resto foi construído. Aqui está a abordagem de referência, para você comparar com a sua.

## Do que este ticket tratava

- Ler uma funcionalidade pela metade antes de acrescentar a ela: o que existe, que forma tem, e onde quem escreveu parou. As anotações `TODO` marcam as paradas; o código em volta mostra a forma.
- Manter uma API coerente: a mesma receita precisa dizer a mesma coisa na lista e na página dela, e um filtro precisa combinar com os outros como os outros combinam.
- `501 Not Implemented` é uma resposta honesta para o que ainda não foi feito. É também uma promessa que alguém tem que cumprir.

## Por que a referência é construída assim

- A receita pega a marca do `favoriteIds()`, o mesmo ajudante que a lista usa. Uma fonte só da verdade: as duas respostas não têm como discordar.
- A mudança é no `getRecipe`, então toda resposta que leva uma receita inteira (ler, editar, publicar) fica certa de uma vez.
- O filtro reaproveita o `ids`, o mecanismo que o filtro de ingrediente já tinha: uma lista de ids permitidos que entra no único `where` da consulta. Combinar favoritas com categoria, busca e ingrediente não precisou de código próprio.
- `favorites=false` e a falta de `favorites` seguem o mesmo caminho, o que não filtra. O esquema da query string já transforma o texto `true`/`false` em booleano.
- O 501 e as duas anotações `TODO` sumiram. Nada mais no código diz "inacabado".

## Compare com o que você construiu

- Você consultou a tabela `favorites` de novo dentro do `getRecipe`, com código novo? Funciona. Agora são dois trechos de código que decidem o que é uma favorita.
- Você filtrou a lista em JavaScript depois da consulta (`recipes.filter((recipe) => favorites.has(recipe.id))`)? O resultado está certo para esta lista. Se a lista um dia ganhar páginas, filtrar depois da consulta quebra as páginas; condição pertence à consulta.
- Você criou `favorite` como coluna de `recipes`? A tabela de favoritas e as duas rotas dela já existem e funcionam. Um segundo lugar para guardar a marca são dois lugares para manter em sincronia.
- Você deixou o 501 para `favorites=false`? Confira essa requisição.
- Você testou o filtro combinado com o de ingrediente? Os dois estreitam a mesma lista de ids, o lugar mais fácil de perder um deles.
- Você tirou as anotações `TODO`?

## Fique de olho da próxima vez

- Em código inacabado, a primeira hora é para ler. Procure o padrão que quem escreveu estava seguindo e continue nele, a menos que você saiba dizer por que ele está errado.
- Quando o mesmo fato aparece em dois lugares (uma lista e um detalhe), faça os dois lerem da mesma função.
- Um `TODO` é uma dívida sem data. Quando terminar o trabalho, apague a anotação.
