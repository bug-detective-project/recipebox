# RB-201: The time "1h30" is accepted when creating a recipe and refused when editing it

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Bianca Moretti (Club organizer) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (recipes) |
| Labels | `api`, `validation`, `prep-time` |
| Sprint | RB Sprint 1 |
| Created | 04/03/2026 15:30 |

## Description

I wrote the **Roast Chicken with Lemon** with a preparation time of `1h30`, and the form took it. Today I opened it to fix a typo in the description, changed nothing else, clicked **Save recipe**, and the form refused under the preparation time:

> must match pattern "^\d+ ?(min)?$"

I did not touch the time. It is the same `1h30` the cookbook itself wrote into the field.

Any recipe of an hour or more does this. If I rewrite the time as `90 min` the save goes through, and then the page shows it as `1h30` again, so the next person who edits it hits the same wall.

## Steps to reproduce

In the VS Code terminal, with the app running (recipe 11 of the sample data is a draft):

```sh
BODY='{"title":"Slow Beef Stew","category":"main","servings":6,"prepTime":"1h30","ingredients":[],"steps":[]}'
curl -i -X POST http://localhost:3001/api/recipes -H 'Content-Type: application/json' -d "$BODY"
curl -i -X PUT http://localhost:3001/api/recipes/11 -H 'Content-Type: application/json' -d "$BODY"
```

Or on the screen: open **Roast Chicken with Lemon**, click **Edit**, then **Save recipe**.

## Expected result

Both requests accept the same ways of writing a time and read them the same way:

| Written | Minutes |
| --- | --- |
| `45`, `45min`, `45 min` | 45 |
| `1h` | 60 |
| `1h30`, `1h 30min` | 90 |
| `2H15` | 135 |

Both refuse what is not a time (`soon`, `h30`, `1h90`, `0`, an empty text) with the same answer: `400` and `{ "error": "Some fields are not valid", "fields": { "prepTime": "Write the time like 45 min or 1h30" } }`.

## Actual result

`POST` answers 201. `PUT` answers 400 with `"prepTime": "must match pattern \"^\\d+ ?(min)?$\""`.

## Acceptance criteria

- [ ] Creating and editing accept the same preparation times and store the same minutes for each.
- [ ] Creating and editing refuse the same texts, with the same 400 answer shown above.
- [ ] A recipe of an hour or more can be saved again from its edit form without retyping the time.

## Environment

- RecipeBox 1.0
- Any browser; also with curl

## Activity

**Ingrid Solberg** · 04/03/2026 16:02
> The message in the form is a regular expression, so it comes from a validation rule, not from a person. And it is a different rule from the one the creation uses, or `1h30` would never have been saved in the first place.
