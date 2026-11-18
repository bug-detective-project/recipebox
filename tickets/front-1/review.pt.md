# Code review: RB-101, o formulário é a lista

O formulário tinha a lista certa o tempo todo. A função que transforma o formulário em requisição remontava a lista a partir da receita salva e trazia de volta o que a pessoa tinha removido. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- O `useFieldArray` guarda as linhas do formulário. O **Remove** chama `remove(index)`, e a linha sai mesmo dos valores do formulário.
- O `inputOf` não confiava nesses valores. Ele percorria os ingredientes da receita salva pela posição e usava a linha do formulário "quando existia". Com menos linhas no formulário, as últimas posições não tinham nenhuma, e as linhas salvas ocupavam o lugar.
- Por isso o último ingrediente voltava igual, e por isso remover um do meio subia os outros e repetia o último.

## Por que a correção de referência está certa

- `ingredients: values.ingredients`. A API troca a lista inteira a cada salvamento, então o que ela precisa é da lista do formulário, e só.
- O `inputOf` volta a receber só os valores, e criar e editar montam a requisição do mesmo jeito.
- Não sobra mistura por posição. Posição deixa de significar alguma coisa no momento em que uma linha é removida ou adicionada no meio.

## Compare com a sua correção

- Você manteve a mistura e cortou o resultado no tamanho do formulário? A última linha removida continua removida, mas confira uma remoção no meio: os nomes e as quantidades ainda são os do formulário?
- Você casou linhas salvas e linhas do formulário pelo nome ou pelo id? Funciona até duas linhas terem o mesmo nome, e mantém um código de que a funcionalidade não precisa.
- Você mexeu no botão **Remove**? Ele estava certo: a linha saía do formulário.
- Você mexeu no servidor? O servidor salvou o que recebeu.

## Fique de olho da próxima vez

- Quando a tela mostra uma coisa e a requisição leva outra, leia antes de tudo o código que fica entre as duas.
- Juntar duas listas pela posição só é seguro quando nada pode ser inserido nem removido. Em um formulário, sempre pode.
