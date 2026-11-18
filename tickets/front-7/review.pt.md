# Code review: RB-107, um manipulador de clique não é um controle

As estrelas pareciam botões e se comportavam como botões para o mouse. Para o teclado e para um leitor de tela, eram cinco pedaços de texto. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- Cada estrela era um `<span onClick={…}>`. O navegador não dá comportamento nenhum a um span: nem lugar na ordem do Tab, nem reação a Espaço ou Enter, nem papel.
- O nome da estrela estava só no `title`, que é uma dica para o ponteiro.
- O "desabilitado" era uma conferência dentro do clique e uma cor mais clara. Nada dizia à tecnologia assistiva que o controle estava indisponível.

## Por que a correção de referência está certa

- Cada estrela é um `<button type="button">`. Foco, Espaço, Enter, o papel e o estado desabilitado vêm todos do elemento. Não há tratamento de tecla a escrever, e portanto nenhum a errar.
- O `aria-label` dá a cada uma o seu nome ("4 stars"), e o símbolo fica com `aria-hidden` para que o nome não seja lido junto com "estrela preta".
- Os botões ficam em um `role="group"` chamado "Rate this recipe", e a pergunta que as estrelas respondem é anunciada com elas.
- O `disabled` é o atributo: enquanto uma avaliação é enviada, os botões não recebem foco nem clique.
- A prévia preenchida segue o foco além do ponteiro, e quem usa o teclado vê quantas estrelas está prestes a dar. O anel de foco é o mesmo de todos os controles do app.

## Compare com a sua correção

- Você manteve os spans e acrescentou `tabIndex={0}`, `role="button"` e um `onKeyDown`? Pode passar, e você reconstruiu à mão o que o `<button>` dá de graça. Confira os detalhes que costumam faltar: Espaço **e** Enter, a página não rolar com o Espaço, e o estado desabilitado (`aria-disabled`, e sem foco).
- Você usou botões de opção (radio) com rótulos? É um bom modelo para "escolha um de cinco", com as setas de graça. Confira se escolher com as setas não envia uma avaliação a cada estrela por onde você passa.
- Você deu às estrelas o nome "★★★★", ou deixou o símbolo como nome? Leitor de tela lê símbolo mal, ou não lê. Os nomes do ticket são os que valem.
- Você tirou o contorno de foco porque "ficou estranho" em uma estrela? Então quem usa o teclado voltou a adivinhar.

## Fique de olho da próxima vez

- Se reage a clique, é um controle: comece por `<button>`, `<a>` ou um `<input>`, e estilize depois.
- Experimente toda tela nova uma vez só com o teclado. Tab, Espaço, Enter: leva um minuto e acha essa classe inteira de bug.
