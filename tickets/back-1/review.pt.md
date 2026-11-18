# Code review: RB-201, uma regra em dois lugares

O caderno sabia ler "1h30". A edição consultava antes uma segunda regra, mais antiga, que nunca tinha ouvido falar de horas. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- Quem decide o que um tempo de preparo significa é o `parsePrepTime`, em `server/src/duration.ts`. Criar e editar acabam os dois lá.
- A rota de edição tinha um esquema próprio, o `recipeUpdateBody`, com um `pattern` para o `prepTime` do tempo em que um tempo era só minutos. O Fastify confere o esquema antes de a rota rodar, então a edição recusava `1h30` antes de o `parsePrepTime` ser consultado.
- A página piorava a situação: ela escreve os minutos salvos de volta como `1h30`, e assim o próprio formulário produzia um valor que a edição recusava.

## Por que a correção de referência está certa

- O `PUT` usa `recipeBody`, o mesmo esquema do `POST`. O esquema diz só que `prepTime` é um texto curto; o significado fica com o `parsePrepTime`.
- O `recipeUpdateBody` e o `MINUTES_PATTERN` foram apagados. Não sobra nada para manter em sincronia.
- As duas rotas agora dão a mesma resposta para um texto que não é um tempo, com uma mensagem que serve para quem cozinha, porque as duas a recebem da mesma função.

## Compare com a sua correção

- Você alargou o padrão da edição até ele aceitar horas? Passa hoje. Agora você tem uma expressão regular em `schemas.ts` e outra em `duration.ts` descrevendo um formato só, e a próxima mudança em uma delas traz este ticket de volta. Confira também `1h90`, e a mensagem que a pessoa vê quando o tempo é recusado.
- Você levou o padrão para o `recipeBody`, para as duas rotas dividirem? Uma regra é melhor que duas, mas o esquema só sabe dizer "casa ou não casa": o 400 levaria a expressão regular em vez de "Write the time like 45 min or 1h30".
- Você mudou o formulário para enviar `90 min`? A API continuaria discordando de si mesma para qualquer outro cliente, e o ticket é sobre a API.
- Você mexeu no `parsePrepTime`? Ele estava certo.

## Fique de olho da próxima vez

- Quando criar e editar se comportam diferente para o mesmo campo, ponha as validações lado a lado. A diferença é o bug.
- Um formato deve ser descrito uma vez. Se um esquema e um parser descrevem o mesmo formato, um dos dois vai ficar desatualizado.
- Uma mensagem de erro que é uma expressão regular é sinal de que uma regra está respondendo no lugar do código que sabe o que dizer.
