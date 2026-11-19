/** An answer the API gives on purpose: the status and the message the cook reads. */
export class HttpError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/** 400: the request asks for something the rules of the cookbook do not allow. */
export class InvalidError extends HttpError {
  constructor(message: string, fields?: Record<string, string>) {
    super(400, message, fields);
  }
}

/** 404: what the request names does not exist. */
export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

/** 409: the request is well formed, and the state of the recipe does not allow it. */
export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}
