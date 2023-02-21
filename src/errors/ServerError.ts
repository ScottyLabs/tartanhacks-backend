import APIError from "./APIError";

/**
 * Internal server error (500)
 */
export default class ServerError extends APIError {
  constructor(public readonly message: string) {
    super(500, message);
  }
}
