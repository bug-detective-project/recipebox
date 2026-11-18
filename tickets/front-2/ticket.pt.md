# RB-102: Formulário aceita receita sem ingredientes

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Média |
| Relator | Bianca Moretti (Organizadora do clube) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Cliente (formulário de receita) |
| Rótulos | `formulário`, `validação`, `react-hook-form` |
| Sprint | RB Sprint 1 |
| Criado em | 02/03/2026 14:25 |

## Descrição

Temos três receitas no caderno sem nenhum ingrediente. Quem escreveu conta que removeu a linha vazia com que o formulário começa, pensando em preencher a lista depois, clicou em **Save recipe**, e o formulário simplesmente salvou.

O formulário deveria impedir isso. Alguém até escreveu a mensagem, "Add at least one ingredient", e eu nunca vi essa mensagem na tela.

Uma receita assim também não pode ser publicada, então a pessoa fica com um rascunho e um botão **Publish** que responde "That did not work".

## Passos para reproduzir

1. Clique em **New recipe** e preencha o título, o tempo de preparo e um passo.
2. Clique em **Remove** na única linha de ingrediente.
3. Clique em **Save recipe**.

## Resultado esperado

O formulário continua aberto e mostra "Add at least one ingredient". Nada é enviado ao servidor.

## Resultado atual

A receita é criada sem ingredientes e a página dela abre.

## Critérios de aceite

- [ ] Uma receita nova sem ingrediente não é enviada: o formulário continua aberto e mostra uma mensagem dizendo que é preciso pelo menos um ingrediente.
- [ ] O mesmo quando todos os ingredientes de uma receita salva são removidos no formulário de edição; a receita salva mantém os ingredientes.
- [ ] Depois que um ingrediente é adicionado, a mensagem some e a receita é salva.
- [ ] Uma receita com um ingrediente ou mais é salva como antes.

## Ambiente

- RecipeBox 1.0
- Qualquer navegador

## Atividade

**Ingrid Solberg** · 02/03/2026 15:02
> A regra está no formulário, dá para ver no código. Ela simplesmente nunca dispara para uma lista vazia. O formulário é feito com React Hook Form: talvez a regra não signifique o que a gente acha que significa.
