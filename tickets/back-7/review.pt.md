# Code review: RB-207, uma linha de registro que serve para alguém

Este ticket não era um bug. O servidor tinha um registro, e o registro não conseguia responder a única pergunta que fizeram a ele. Aqui está a abordagem de referência, para você comparar com a sua.

## Do que este ticket tratava

- Escrever uma linha de registro que responde a uma pergunta: o que foi feito, em qual receita, por quem. Uma linha que só diz "PUT /api/recipes/4" não responde a nenhuma das três.
- Usar o logger que já existe, no formato que ele já tem (um objeto JSON por linha), para que as linhas novas possam ser buscadas e filtradas como as outras.
- Decidir o que **não** pode estar em um registro: o que os usuários digitaram, e qualquer coisa que um cliente possa mandar sem conferência.

## Por que a referência é construída assim

- O `cookOf(request)` mora em um arquivo próprio, `server/src/cook.ts`. Saber quem está chamando vai ser útil em outros lugares, e a regra do nome válido fica escrita uma vez.
- O cabeçalho é conferido contra um padrão ancorado antes de chegar ao registro. Um cabeçalho é texto escolhido pelo cliente: sem a conferência, qualquer pessoa poderia escrever texto arbitrário, com quebras de linha e tudo, no registro do servidor.
- O `logChange` usa `request.log`, e não um logger global. A linha leva o `reqId`, e assim pode ser ligada às linhas da própria requisição (endereço, status, duração) sem repetir o que elas dizem.
- Os campos são estruturados (`event`, `action`, `recipeId`, `cook`), e não uma frase. `recipe.changed` mais um id é algo que uma busca encontra; "Leo updated the roast chicken" não é.
- A chamada vem depois de a alteração dar certo. O registro diz o que aconteceu, e não o que foi tentado.
- Só o id da receita é registrado. A receita em si está no banco; copiá-la para o registro colocaria o texto das pessoas em um arquivo que ninguém revisa.

## Compare com o que você construiu

- Você registrou antes de chamar o `updateRecipe`, ou em um hook `preHandler` para todo `PUT`? Então alterações que falharam são registradas como alterações. Confira um `PUT` em uma receita que não existe.
- Você escreveu o cabeçalho no registro do jeito que veio? Mande `X-Cook: <script>` ou um nome de 500 caracteres e leia o seu registro.
- Você usou `console.log`, ou montou o JSON à mão? A linha fica sem o `reqId` e sem o nível, e pode nem ser JSON válido quando um valor tem aspas.
- Você pôs o nome na mensagem (`"Leo updated recipe 4"`) em vez de em um campo? Uma pessoa consegue ler; um filtro não.
- Você registrou `request.body`, ou a receita que foi salva? Títulos e passos agora estão no registro.
- Você registrou também avaliações e favoritas? O ticket pede alterações na receita em si; mais linhas tornam mais difícil achar as que importam.

## Fique de olho da próxima vez

- Antes de escrever uma linha de registro, diga qual pergunta ela vai responder e quem vai perguntar.
- Um registro é uma saída do seu programa. Trate o que entra nele como o que entra em uma página: confira o que vem de fora, e deixe de fora o que quem lê não deveria ver.
- Campos estruturados primeiro, frase por último. A frase é para quem passa os olhos; os campos são para encontrar.
