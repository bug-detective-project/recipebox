import type { FastifyInstance } from 'fastify';
import { addFavorite, removeFavorite } from '../recipes.ts';

interface RecipeId {
  recipeId: string;
}

// A favorite is a mark on a recipe, so the address names the recipe: PUT puts the mark, DELETE
// takes it away, and doing either twice changes nothing.
export function favoriteRoutes(app: FastifyInstance): void {
  app.put<{ Params: RecipeId }>('/api/favorites/:recipeId', async (request, reply) => {
    await addFavorite(Number(request.params.recipeId));
    return reply.status(204).send();
  });

  app.delete<{ Params: RecipeId }>('/api/favorites/:recipeId', async (request, reply) => {
    await removeFavorite(Number(request.params.recipeId));
    return reply.status(204).send();
  });
}
