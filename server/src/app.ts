import Fastify from 'fastify';
import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Sequelize } from 'sequelize';
import { HttpError } from './errors.ts';
import { favoriteRoutes } from './routes/favorites.ts';
import { recipeRoutes } from './routes/recipes.ts';
import { fieldsOf } from './schemas.ts';

export interface AppOptions {
  /**
   * Where the server writes its log, one JSON object per line: `true` for the terminal, or a
   * stream (the tests read what was written). Without it the server is quiet.
   */
  logger?: boolean | { write: (line: string) => void };
}

export function createApp(sequelize: Sequelize, options: AppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: typeof options.logger === 'object' ? { level: 'info', stream: options.logger } : options.logger === true ? { level: 'info' } : false,
    // Every field that does not fit its schema is reported, not only the first one.
    ajv: { customOptions: { allErrors: true } },
  });

  app.addHook('onRequest', allowedHost);
  app.setErrorHandler(handleError);
  app.setNotFoundHandler((_request, reply) => reply.status(404).send({ error: 'Not found' }));

  recipeRoutes(app, sequelize);
  favoriteRoutes(app);

  return app;
}

/** Hosts the API answers; the port is ignored. */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * The app runs on the player's computer and only the local client talks to it: a page on the
 * internet that reaches the API through the browser sends another Host, and gets 403.
 */
async function allowedHost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const host = request.headers.host ?? '';
  const name = host.startsWith('[') ? host.slice(0, host.indexOf(']') + 1) : host.replace(/:\d+$/, '');
  if (!LOCAL_HOSTS.has(name.toLowerCase())) {
    await reply.status(403).send({ error: 'Forbidden host' });
  }
}

/**
 * Turns what a route threw into an answer. The cook reads the body, so it never carries what only
 * the team should see: an error nobody planned for goes to the log, and the answer says only that
 * something went wrong.
 */
function handleError(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply): FastifyReply {
  // A request that does not fit the schema of its route.
  if ('validation' in error && error.validation) {
    return reply.status(400).send({ error: 'Some fields are not valid', fields: fieldsOf(error.validation) });
  }
  // An answer a rule of the cookbook gave on purpose.
  if (error instanceof HttpError) {
    return reply.status(error.status).send({ error: error.message, fields: error.fields });
  }
  // A request Fastify itself refused, such as a body that is not JSON.
  if ('statusCode' in error && typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500) {
    return reply.status(error.statusCode).send({ error: error.message });
  }
  request.log.error(error);
  return reply.status(500).send({ error: 'Internal server error' });
}
