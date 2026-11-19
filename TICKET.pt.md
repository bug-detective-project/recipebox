# RB-202: Porções salvas como texto quebram o cálculo de rendimento

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
| Rótulos | `api`, `porções`, `tipos` |
| Sprint | RB Sprint 1 |
| Criado em | 05/03/2026 18:10 |

## Descrição

Abra qualquer receita e aperte o **+** das porções. A **Banana Pancakes** é para 4; um toque e a página diz **41 servings** e pede 2050 g de farinha. Mais um toque: **411 servings**.

O **−** se comporta: de 4 vai para 3, e as quantidades ficam certas. De 3, o **+** volta para 4 como deveria. É só o primeiro **+** em uma receita que enlouquece.

A Ingrid olhou o que o servidor envia e diz que as porções chegam entre aspas. Ela também conseguiu salvar uma receita com as porções `many`, que o formulário nem deixa: fez com o curl. Essa receita mostra "many servings" e todas as quantidades como `NaN`.

## Passos para reproduzir

No terminal do VS Code, com o app rodando:

```sh
curl http://localhost:3001/api/recipes/1
curl -i -X POST http://localhost:3001/api/recipes -H 'Content-Type: application/json' \
  -d '{"title":"Mystery Stew","category":"main","servings":"many","prepTime":"30 min","ingredients":[],"steps":[]}'
```

Na tela: abra a **Banana Pancakes** e clique no **+** ao lado das porções.

## Resultado esperado

- O `GET /api/recipes/1` responde `"servings": 4`, um número, e a lista também.
- O `POST` responde `400` com `servings` entre os `fields`: as porções são um número inteiro de 1 a 100.
- Na página, o **+** vai de 4 para 5 porções, e a farinha de 200 g para 250 g.

## Resultado atual

- `"servings": "4"`, um texto.
- O `POST` responde 201.
- A página vai de 4 para 41 porções.

## Critérios de aceite

- [ ] A lista e a receita respondem as porções como um número JSON.
- [ ] Criar e editar salvam as porções como número, e respondem como número.
- [ ] Porções que não são um número inteiro de 1 a 100 (`0`, `-2`, `101`, `2.5`, `"many"`, `"4-6"`) são recusadas com 400 e `servings` em `fields`.
- [ ] Na página da receita, cada toque no **+** acrescenta exatamente uma porção.

## Ambiente

- RecipeBox 1.0
- Qualquer navegador; também com curl

## Atividade

**Ingrid Solberg** · 05/03/2026 18:34
> 4 + 1 = 41 é o que dá quando o 4 é um texto: "4" + 1. A página só soma um ao que recebe. Eu seguiria o 4 de trás para a frente, da página até onde ele fica guardado.
