# RB-206: Receita publicada volta a rascunho e perde as avaliações

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Leo Tanaka (Cozinheiro voluntário) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (receitas) |
| Rótulos | `api`, `status`, `avaliações` |
| Sprint | RB Sprint 2 |
| Criado em | 12/03/2026 09:15 |

## Descrição

Corrigi um erro de digitação na descrição da **Banana Pancakes** e salvei. A receita voltou com a etiqueta **Draft** e "No ratings yet". Ela tinha 4.7 em três avaliações, e as estrelas para avaliar sumiram da página dela.

Publiquei de novo. Está publicada, e as três avaliações não voltaram. Sumiram de vez.

Ou seja, toda edição de uma receita publicada joga fora o que o clube achou dela. O pessoal parou de corrigir receitas por causa disso, que é o contrário do que a gente quer.

A regra do caderno, como a Bianca escreveu quando começamos:

- Uma receita nova é um rascunho. Publicar é um passo à parte, e editar nunca muda se uma receita está publicada.
- As avaliações pertencem à receita. Elas só somem quando a receita é apagada.

## Passos para reproduzir

No terminal do VS Code, com o app rodando (a receita 1 está publicada e tem três avaliações):

```sh
curl http://localhost:3001/api/recipes/1
curl -X PUT http://localhost:3001/api/recipes/1 -H 'Content-Type: application/json' \
  -d '{"title":"Banana Pancakes","category":"breakfast","servings":4,"prepTime":"25 min","ingredients":[{"name":"egg","quantity":2}],"steps":["Cook."]}'
```

Ou pela tela: abra a **Banana Pancakes**, clique em **Edit** e depois em **Save recipe**.

## Resultado esperado

A resposta do `PUT` tem `"status": "published"` e `"rating": { "average": 4.7, "count": 3 }`, como antes da edição.

## Resultado atual

`"status": "draft"` e `"rating": { "average": null, "count": 0 }`.

## Critérios de aceite

- [ ] Editar uma receita publicada mantém a receita publicada.
- [ ] Editar uma receita mantém as avaliações dela, e ela continua podendo ser avaliada depois.
- [ ] Editar um rascunho mantém o rascunho.
- [ ] Uma receita nova continua sendo criada como rascunho, e publicar continua sendo feito por `POST /api/recipes/:id/publish`.

## Ambiente

- RecipeBox 1.0
- Qualquer navegador; também com curl

## Atividade

**Bianca Moretti** · 12/03/2026 09:40
> O formulário nem tem campo para o status, então não é algo que a página envia. O servidor decide isso sozinho.
