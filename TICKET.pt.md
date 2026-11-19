# RB-203: Excluir uma receita que não existe é respondido como sucesso

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Média |
| Relator | Ingrid Solberg (Responsável pelo site) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (receitas) |
| Rótulos | `api`, `exclusão`, `códigos-de-status` |
| Sprint | RB Sprint 1 |
| Criado em | 05/03/2026 10:20 |

## Descrição

Eu mantenho um pequeno script que arruma o caderno depois de cada noite do clube: ele apaga as receitas de teste pelo id. Semana passada digitei um id errado. O script disse que deu tudo certo, e a receita de teste continuava na lista na manhã seguinte.

A API respondeu `204 No Content` para uma receita que nunca existiu. Ela diz o mesmo para um id como `abc`. Sucesso quer dizer "sumiu por causa do que você pediu"; aqui não aconteceu nada.

Todas as outras requisições sobre uma receita (ler, editar, publicar) respondem 404 quando a receita não existe. A exclusão também deveria.

## Passos para reproduzir

No terminal do VS Code, com o app rodando:

```sh
curl -i -X DELETE http://localhost:3001/api/recipes/999
curl -i -X DELETE http://localhost:3001/api/recipes/abc
```

## Resultado esperado

`404` com `{ "error": "Recipe not found" }` nos dois casos, e nada removido.

## Resultado atual

`204 No Content` nos dois.

## Critérios de aceite

- [ ] Excluir um id que nunca existiu responde 404 com `{ "error": "Recipe not found" }`.
- [ ] Excluir a mesma receita pela segunda vez responde 404.
- [ ] Um id que não é um número inteiro positivo (`abc`, `1.5`, `0`, `-3`) responde 404.
- [ ] Uma exclusão que responde 404 não remove nada.
- [ ] Excluir uma receita que existe continua respondendo 204 com corpo vazio, e a receita some.

## Ambiente

- RecipeBox 1.0
- curl e um script de shell

## Atividade

**Ingrid Solberg** · 05/03/2026 10:41
> O banco sabe a resposta: uma exclusão diz quantas linhas removeu. Alguém não está perguntando.
