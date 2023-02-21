import APIError from "./APIError";

/**
 * Not found error (404)
 */
export default class NotFoundError extends APIError {
  constructor(public readonly message: string) {
    super(404, message);
  }
}
