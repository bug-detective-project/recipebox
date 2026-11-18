# RB-201: Tempo "1h30" é aceito ao criar uma receita e recusado ao editar

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Bianca Moretti (Organizadora do clube) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (receitas) |
| Rótulos | `api`, `validação`, `tempo-de-preparo` |
| Sprint | RB Sprint 1 |
| Criado em | 04/03/2026 15:30 |

## Descrição

Escrevi a **Roast Chicken with Lemon** com tempo de preparo `1h30`, e o formulário aceitou. Hoje abri a receita para corrigir um erro de digitação na descrição, não mudei mais nada, cliquei em **Save recipe**, e o formulário recusou, embaixo do tempo de preparo:

> must match pattern "^\d+ ?(min)?$"

Eu não toquei no tempo. É o mesmo `1h30` que o próprio caderno escreveu no campo.

Toda receita de uma hora ou mais faz isso. Se eu reescrevo o tempo como `90 min`, o salvamento passa, e aí a página mostra `1h30` de novo, então a próxima pessoa que editar bate na mesma parede.

## Passos para reproduzir

No terminal do VS Code, com o app rodando (a receita 11 dos dados de exemplo é um rascunho):

```sh
BODY='{"title":"Slow Beef Stew","category":"main","servings":6,"prepTime":"1h30","ingredients":[],"steps":[]}'
curl -i -X POST http://localhost:3001/api/recipes -H 'Content-Type: application/json' -d "$BODY"
curl -i -X PUT http://localhost:3001/api/recipes/11 -H 'Content-Type: application/json' -d "$BODY"
```

Ou pela tela: abra a **Roast Chicken with Lemon**, clique em **Edit** e depois em **Save recipe**.

## Resultado esperado

As duas requisições aceitam os mesmos jeitos de escrever um tempo e leem todos do mesmo jeito:

| Escrito | Minutos |
| --- | --- |
| `45`, `45min`, `45 min` | 45 |
| `1h` | 60 |
| `1h30`, `1h 30min` | 90 |
| `2H15` | 135 |

As duas recusam o que não é um tempo (`soon`, `h30`, `1h90`, `0`, um texto vazio) com a mesma resposta: `400` e `{ "error": "Some fields are not valid", "fields": { "prepTime": "Write the time like 45 min or 1h30" } }`.

## Resultado atual

O `POST` responde 201. O `PUT` responde 400 com `"prepTime": "must match pattern \"^\\d+ ?(min)?$\""`.

## Critérios de aceite

- [ ] Criar e editar aceitam os mesmos tempos de preparo e guardam os mesmos minutos para cada um.
- [ ] Criar e editar recusam os mesmos textos, com a mesma resposta 400 mostrada acima.
- [ ] Uma receita de uma hora ou mais pode ser salva de novo pelo formulário de edição sem redigitar o tempo.

## Ambiente

- RecipeBox 1.0
- Qualquer navegador; também com curl

## Atividade

**Ingrid Solberg** · 04/03/2026 16:02
> A mensagem do formulário é uma expressão regular, então ela vem de uma regra de validação, e não de uma pessoa. E é uma regra diferente da que a criação usa, senão o `1h30` nunca teria sido salvo.
