# Code review: RB-104, quem avisa o cache

Não havia nada errado com o salvamento, nem com o componente da lista. O cliente guarda cópias do que a API respondeu, e depois de uma edição ele só jogava fora uma delas. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- O TanStack Query guarda cada resposta em cache com uma chave. Este projeto mantém uma lista por um minuto antes de perguntar de novo (`staleTime` em `queryClient.ts`), e é isso que faz a troca de páginas parecer instantânea.
- Uma mudança no servidor não chega sozinha a essas cópias. A mutação precisa dizer quais chaves ficaram desatualizadas.
- O `useUpdateRecipe` invalidava só `['recipes', 'detail', id]`. A página da receita era buscada de novo; todas as listas em cache continuavam com a receita antiga e ainda eram consideradas frescas.

## Por que a correção de referência está certa

- `invalidateQueries({ queryKey: ['recipes'] })` casa pelo prefixo: todas as listas (com quaisquer filtros) e todas as páginas de receita.
- É o que as outras mutações do arquivo já fazem. Uma edição pode mudar o título, a categoria e o tempo, que as listas mostram e usam para filtrar, então ela desatualiza os mesmos lugares que uma criação.
- As consultas invalidadas que estão na tela são buscadas na hora; as outras, quando forem mostradas de novo. A lista é pedida uma vez, quando a pessoa volta para ela.

## Compare com a sua correção

- Você baixou o `staleTime` para 0, ou ligou `refetchOnMount: 'always'`? A lista fica certa, e toda visita a ela passa a esperar a rede. O cache não é o bug; o bug é a invalidação que falta.
- Você escreveu a receita nova nas listas em cache com `setQueryData`? Dá para fazer bem feito, mas cada lista em cache tem seus filtros e sua ordem: uma receita renomeada pode ter que mudar de posição, entrar ou sair de uma lista. Invalidar deixa o servidor decidir.
- Você adicionou um segundo `invalidateQueries` para `['recipes', 'list']`? Funciona. Um prefixo só diz o mesmo com menos.
- Você recarregou a página depois de salvar? Tudo o que a pessoa tinha na tela se perde junto.

## Fique de olho da próxima vez

- Com cache no cliente, toda mudança precisa de uma resposta para "quais cópias ficaram erradas agora?". Leia as mutações de um arquivo lado a lado: a que destoa costuma ser o bug.
- "Certo depois de recarregar, errado antes" aponta para algo que o cliente está segurando, e não para o servidor.
