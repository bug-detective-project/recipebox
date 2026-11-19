import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Sequelize } from 'sequelize';
import { cookOf } from '../cook.ts';
import { createRecipe, deleteRecipe, getRecipe, listRecipes, publishRecipe, rateRecipe, updateRecipe } from '../recipes.ts';
import type { ListFilters, RecipeInput } from '../recipes.ts';
import { listQuery, ratingBody, recipeBody } from '../schemas.ts';

interface Id {
  id: string;
}

type Action = 'created' | 'updated' | 'published' | 'deleted';

/**
 * One line in the log per change to a recipe: what was done, to which recipe and by which cook.
 * What the cook typed never goes to the log.
 */
function logChange(request: FastifyRequest, action: Action, recipeId: number): void {
  request.log.info({ event: 'recipe.changed', action, recipeId, cook: cookOf(request) }, `recipe ${action}`);
}

export function recipeRoutes(app: FastifyInstance, sequelize: Sequelize): void {
  app.get<{ Querystring: ListFilters }>('/api/recipes', { schema: { querystring: listQuery } }, (request, reply) => {
    // TODO: "Only favorites" of the list.
    if (request.query.favorites) {
      return reply.status(501).send({ error: 'The favorites filter is not implemented yet' });
    }
    return listRecipes(request.query);
  });

  app.post<{ Body: RecipeInput }>('/api/recipes', { schema: { body: recipeBody } }, async (request, reply) => {
    const recipe = await createRecipe(sequelize, request.body);
    logChange(request, 'created', recipe.id);
    return reply.status(201).send(recipe);
  });

  app.get<{ Params: Id }>('/api/recipes/:id', (request) => {
    return getRecipe(Number(request.params.id));
  });

  app.put<{ Params: Id; Body: RecipeInput }>('/api/recipes/:id', { schema: { body: recipeBody } }, async (request) => {
    const recipe = await updateRecipe(sequelize, Number(request.params.id), request.body);
    logChange(request, 'updated', recipe.id);
    return recipe;
  });

  app.delete<{ Params: Id }>('/api/recipes/:id', async (request, reply) => {
    const id = Number(request.params.id);
    await deleteRecipe(id);
    logChange(request, 'deleted', id);
    return reply.status(204).send();
  });

  app.post<{ Params: Id }>('/api/recipes/:id/publish', async (request) => {
    const recipe = await publishRecipe(Number(request.params.id));
    logChange(request, 'published', recipe.id);
    return recipe;
  });

  app.post<{ Params: Id; Body: { stars: number } }>('/api/recipes/:id/ratings', { schema: { body: ratingBody } }, async (request, reply) => {
    const rating = await rateRecipe(Number(request.params.id), request.body.stars);
    return reply.status(201).send(rating);
  });
}
