import type { FastifyRequest } from 'fastify';

/** A name the cookbook accepts for a cook: letters, digits, spaces, dots, apostrophes and dashes; 1 to 40. */
const COOK_NAME = /^[A-Za-z0-9 .'-]{1,40}$/;

export const UNKNOWN_COOK = 'unknown';

/**
 * Who is using the cookbook. There is no login: the client sends the name the cook picked in the
 * header X-Cook. A request without it, or with something that is not a name, is from "unknown".
 */
export function cookOf(request: FastifyRequest): string {
  const header = request.headers['x-cook'];
  const name = typeof header === 'string' ? header.trim() : '';
  return COOK_NAME.test(name) ? name : UNKNOWN_COOK;
}
