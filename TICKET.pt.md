# RB-101: Ingrediente removido volta quando a receita é salva

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Leo Tanaka (Cozinheiro voluntário) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Cliente (formulário de receita) |
| Rótulos | `formulário`, `ingredientes`, `edição` |
| Sprint | RB Sprint 1 |
| Criado em | 02/03/2026 09:10 |

## Descrição

Editei a **Banana Pancakes** para tirar a manteiga. Cliquei em **Remove** na linha da manteiga, a linha sumiu, salvei, e a página da receita continua listando a manteiga.

Fica mais estranho quando o ingrediente não é o último. Tirei o ovo da mesma receita e, depois de salvar, o ovo tinha sumido, mas a manteiga aparecia duas vezes.

Adicionar ingredientes funciona, e mudar uma quantidade também. Só remover está quebrado, e só em receita que já existe: em **New recipe**, as linhas que eu removo continuam removidas.

## Passos para reproduzir

1. Abra a **Banana Pancakes** e clique em **Edit**.
2. Clique em **Remove** no último ingrediente (butter). O formulário passa a mostrar quatro linhas.
3. Clique em **Save recipe**.

## Resultado esperado

A receita é salva com os quatro ingredientes que o formulário mostrava.

## Resultado atual

A página da receita volta a mostrar cinco ingredientes, com a manteiga.

## Critérios de aceite

- [ ] Um ingrediente removido no formulário de edição não está na receita depois de salvar, seja a última linha ou uma do meio.
- [ ] Os outros ingredientes mantêm nome, quantidade e unidade, na ordem do formulário.
- [ ] Remover algumas linhas e adicionar outras na mesma edição salva exatamente as linhas do formulário.
- [ ] Salvar sem mudar nada mantém todos os ingredientes.

## Ambiente

- RecipeBox 1.0
- Chrome em um notebook

## Atividade

**Leo Tanaka** · 02/03/2026 09:31
> Olhei a requisição no navegador: a manteiga já está no que a página envia. Então o servidor está fazendo o que mandam.
