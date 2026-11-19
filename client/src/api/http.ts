import { currentCook } from '../cook.ts';

/** An answer of the API that is not a success. */
export class ApiError extends Error {
  status: number;
  /** The message of each field the API refused, for a 400. */
  fields: Record<string, string>;

  constructor(status: number, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/** Calls the API and gives back the JSON of the answer (nothing for a 204). */
export async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(path, {
    method: init.method ?? 'GET',
    headers: {
      // Who is asking: the cook picked in the header of the page.
      'X-Cook': currentCook(),
      ...(init.body !== undefined && { 'Content-Type': 'application/json' }),
    },
    ...(init.body !== undefined && { body: JSON.stringify(init.body) }),
  });
  if (response.status === 204) {
    return undefined as T;
  }
  const data = (await response.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string> };
  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? `Request failed (${response.status})`, data.fields);
  }
  return data as T;
}
