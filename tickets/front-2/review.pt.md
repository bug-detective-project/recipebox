# Code review: RB-102, uma regra que nunca é consultada

O formulário tinha uma regra para a lista de ingredientes e um lugar para mostrar a mensagem dela. A regra foi escrita com uma opção que a biblioteca pula quando a lista está vazia. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- Os ingredientes são um field array, e um field array pode ter regras próprias: `useFieldArray({ rules })`.
- A regra era `minLength: { value: 1, … }`. Ela se lê como "pelo menos um item", mas no React Hook Form o `minLength` só é conferido quando o campo não está vazio. Para o vazio existe o `required`.
- Um array vazio é um valor vazio. A regra funcionava para todas as listas, menos para aquela para a qual foi escrita.

## Por que a correção de referência está certa

- `validate: (items) => items.length > 0 || 'Add at least one ingredient'` diz exatamente o que se quer e roda para qualquer valor, vazio ou não.
- A mensagem vai para `errors.ingredients.root`, o lugar das regras de uma lista inteira, e o formulário já mostrava o que chega ali.
- O `handleSubmit` roda as regras antes de chamar a função de envio, então regra falhando significa nenhuma requisição. Não há uma segunda conferência a escrever antes do `save`.

## Compare com a sua correção

- Você conferiu `values.ingredients.length` dentro da função de envio e chamou `setError`? Isso barra a requisição, mas a regra passa a morar fora da validação do formulário: a mensagem não some sozinha quando uma linha é adicionada, e a próxima pessoa vai procurar por ela em `rules`.
- Você desabilitou o botão **Remove** da última linha? A lista não fica mais vazia, e a pessoa também não consegue limpar uma linha que adicionou por engano. E a regra enganosa continua lá.
- Você colocou a conferência no servidor? O servidor aceita rascunho sem ingredientes de propósito; é ao publicar que ele recusa. O ticket é sobre o formulário.

## Fique de olho da próxima vez

- Uma opção de biblioteca significa o que a documentação diz, e não o que o nome sugere. Quando uma regra "não dispara", leia a referência da regra antes de ler o seu código pela terceira vez.
- Teste uma validação com o valor para o qual ela existe. Aqui era a lista vazia, o único caso nunca experimentado.
