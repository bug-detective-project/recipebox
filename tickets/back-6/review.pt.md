# Code review: RB-206, o que uma edição pode mudar

Uma edição deveria mudar o que a pessoa digitou. Esta também zerava o status e apagava as avaliações, por causa de um valor que estava certo para a criação e de uma "regra" que ninguém pediu. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- O `fieldsOf` transforma a requisição em colunas, para criar e para editar. Ele incluía `status: 'draft'`. Em uma criação isso é verdade; em uma edição, sobrescrevia `published`.
- O `updateRecipe` depois apagava as avaliações da receita, com o comentário "ratings are of published recipes only". Essa frase fala de quem pode **ser avaliada**. O código fez dela um motivo para apagar o que já tinha sido dado.
- Os dois juntos tornavam o estrago permanente: publicar de novo recuperava o status e não encontrava avaliação nenhuma.

## Por que a correção de referência está certa

- O `fieldsOf` devolve só o que vem da requisição. Nada nele consegue mudar uma coluna que a pessoa não enviou.
- Uma receita nova é rascunho porque o modelo diz (`defaultValue: 'draft'`), em um lugar só.
- O status muda em uma função, a `publishRecipe`, que é o "passo à parte" da regra.
- O `Rating.destroy` sumiu. As avaliações são removidas junto com a receita pelo banco (`onDelete: 'CASCADE'`), o único caso que a regra permite.
- A regra "só receitas publicadas são avaliadas" continua morando onde deve, na `rateRecipe`.

## Compare com a sua correção

- Você manteve o `status` no `fieldsOf` e gravou `recipe.status` de volta na edição? O resultado está certo, e o `fieldsOf` continua entregando um status a todo mundo que o chama, à espera do próximo que esquecer de sobrescrever.
- Você manteve o `Rating.destroy` atrás de um `if (recipe.status === 'draft')`? Então a edição de um rascunho ainda apaga avaliações. Um rascunho pode ter avaliações? Hoje não. Código que apaga dado "por via das dúvidas" merece ser removido, e não protegido.
- Você aceitou um campo `status` no corpo da edição? Isso muda a API: qualquer cliente poderia publicar, ou despublicar, por uma edição, contornando a `publishRecipe` e as conferências dela.
- Você fez a página publicar a receita de novo depois de cada salvamento? As avaliações continuam sendo apagadas, e a regra continua quebrada para qualquer outro cliente.

## Fique de olho da próxima vez

- Uma função dividida por criar e editar só pode conter o que vale para os dois. Valor padrão de registro novo pertence à criação, ou ao modelo.
- Apagar dado precisa de uma regra que mande apagar. "Pertence a" e "só para" não são instruções de exclusão.
- Leia uma atualização como a lista de todas as colunas que ela grava, e pergunte de cada uma: a pessoa pediu isso?
