# RB-104: Receita editada continua antiga na lista

| Campo | Valor |
| --- | --- |
| Projeto | RecipeBox (RB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Leo Tanaka (Cozinheiro voluntário) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Cliente (cache de dados) |
| Rótulos | `lista`, `cache`, `tanstack-query` |
| Sprint | RB Sprint 1 |
| Criado em | 03/03/2026 16:40 |

## Descrição

Troquei o nome da **Cheese Toastie** para "Grilled Cheese". A página da receita mostra o nome novo logo depois de salvar. Aí eu clico em **All recipes** e o card continua dizendo **Cheese Toastie**, com a descrição antiga.

Se eu recarrego a página, a lista fica certa. Se eu espero mais ou menos um minuto e volto para a lista, também fica certa. Então o salvamento funciona; a lista é que mostra uma coisa velha por um tempo.

Duas pessoas já editaram a mesma receita duas vezes, achando que o primeiro salvamento tinha falhado.

## Passos para reproduzir

1. Abra a lista, depois abra a **Cheese Toastie** e clique em **Edit**.
2. Mude o título para `Grilled Cheese` e clique em **Save recipe**. A página da receita mostra o título novo.
3. Clique em **All recipes**.

## Resultado esperado

O card mostra **Grilled Cheese**, sem recarregar.

## Resultado atual

O card continua mostrando **Cheese Toastie** até a página ser recarregada.

## Critérios de aceite

- [ ] Depois que uma receita é editada, a lista mostra o título, o tempo, a categoria e a descrição novos sem recarregar.
- [ ] Uma lista que estava filtrada antes da edição também mostra a receita salva.
- [ ] A página da receita continua mostrando a receita salva logo depois de salvar.

## Ambiente

- RecipeBox 1.0
- Chrome em um notebook

## Atividade

**Ingrid Solberg** · 03/03/2026 17:05
> Se ajudar: uma receita nova aparece na lista na hora, e uma apagada some na hora. É só a edição que a lista não percebe.
