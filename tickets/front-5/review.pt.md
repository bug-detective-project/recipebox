# Code review: RB-105, nem toda resposta é um sucesso

As páginas sabiam o que fazer com uma receita que não existe. Elas nunca ficavam sabendo, porque o código que buscava a receita transformava qualquer resposta, inclusive os erros, em uma receita. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- O `fetch` resolve para qualquer resposta que o servidor dá. 404 e 500 são respostas. Ele só rejeita quando não há resposta nenhuma.
- O `fetchRecipe` não conferia `response.ok`. Ele lia o corpo do 404 e espalhava por cima do `EMPTY_RECIPE`, e a página recebia uma "receita" com todos os campos no valor padrão.
- Preencher valores padrão também escondeu o problema: sem eles, a página teria falhado com barulho no primeiro campo que faltasse.

## Por que a correção de referência está certa

- O `useRecipe` usa o `request`, o ajudante que todas as outras chamadas do arquivo usam. Ele lança um `ApiError` com o status quando a resposta não é de sucesso.
- O TanStack Query põe então a consulta em estado de erro, e as páginas já se dividem a partir dele: 404 mostra "Recipe not found", o resto mostra "The recipe could not be loaded".
- O `EMPTY_RECIPE` sumiu. A API sempre responde uma receita inteira, então os valores padrão não tinham nada a consertar e tinham uma coisa a esconder.
- Um lugar só decide o que é uma resposta que falhou. A página de edição foi consertada pela mesma linha.

## Compare com a sua correção

- Você manteve o `fetch` e adicionou `if (!response.ok) throw new Error(...)`? A receita vazia some, mas um `Error` simples não tem status: a página não consegue separar "não encontrada" de "o servidor caiu", e um dos dois recebe a mensagem errada.
- Você conferiu na página se `recipe.title` está vazio, ou se `recipe.id` é 0? Isso adivinha pelo sintoma. O servidor já disse o que aconteceu; o status é o fato.
- Você manteve o `EMPTY_RECIPE` "por via das dúvidas"? Pergunte qual dúvida. Dado da sua própria API deve ser conferido na porta, e não remendado em silêncio.
- Você consertou só a `RecipePage`? O formulário de edição de uma receita que não existe precisa da mesma resposta.

## Fique de olho da próxima vez

- Com `fetch`, sempre decida o que acontece quando `response.ok` é falso. Melhor ainda: tenha um ajudante só que decide, e não chame mais nada.
- Desconfie de valor padrão para dado que deveria estar completo. Ele transforma uma falha clara em uma tela errada.
