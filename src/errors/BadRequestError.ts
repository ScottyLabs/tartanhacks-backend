import APIError from "./APIError";

/**
 * Bad request error (400)
 */
export default class BadRequestError extends APIError {
  constructor(public readonly message: string) {
    super(400, message);
  }
}
