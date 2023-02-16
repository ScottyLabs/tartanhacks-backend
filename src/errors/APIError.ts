/**
 * Generic API error
 */
export default class APIError {
  constructor(
    public readonly statusCode: number,
    public readonly message: string
  ) {}
}
