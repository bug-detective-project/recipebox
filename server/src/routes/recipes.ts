import type { FastifyInstance } from 'fastify';
import type { Sequelize } from 'sequelize';
import { createRecipe, deleteRecipe, getRecipe, listRecipes, publishRecipe, rateRecipe, updateRecipe } from '../recipes.ts';
import type { ListFilters, RecipeInput } from '../recipes.ts';
import { listQuery, ratingBody, recipeBody } from '../schemas.ts';

interface Id {
  id: string;
}

export function recipeRoutes(app: FastifyInstance, sequelize: Sequelize): void {
  app.get<{ Querystring: ListFilters }>('/api/recipes', { schema: { querystring: listQuery } }, (request) => {
    return listRecipes(request.query);
  });

  app.post<{ Body: RecipeInput }>('/api/recipes', { schema: { body: recipeBody } }, async (request, reply) => {
    const recipe = await createRecipe(sequelize, request.body);
    return reply.status(201).send(recipe);
  });

  app.get<{ Params: Id }>('/api/recipes/:id', (request) => {
    return getRecipe(Number(request.params.id));
  });

  app.put<{ Params: Id; Body: RecipeInput }>('/api/recipes/:id', { schema: { body: recipeBody } }, (request) => {
    return updateRecipe(sequelize, Number(request.params.id), request.body);
  });

  app.delete<{ Params: Id }>('/api/recipes/:id', async (request, reply) => {
    await deleteRecipe(Number(request.params.id));
    return reply.status(204).send();
  });

  app.post<{ Params: Id }>('/api/recipes/:id/publish', (request) => {
    return publishRecipe(Number(request.params.id));
  });

  app.post<{ Params: Id; Body: { stars: number } }>('/api/recipes/:id/ratings', { schema: { body: ratingBody } }, async (request, reply) => {
    const rating = await rateRecipe(Number(request.params.id), request.body.stars);
    return reply.status(201).send(rating);
  });
}
