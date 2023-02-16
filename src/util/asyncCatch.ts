import { NextFunction, Request, Response } from "express";

/**
 * Wrapper for async express handlers to catch async errors gracefully
 * @param fn Async route handler
 */
export const asyncCatch = (
  fn: (req: Request, res: Response) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    return Promise.resolve(fn(req, res)).catch(next);
  };
};
