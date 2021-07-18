import { Request, Response } from "express";
import { error } from "./error";

/**
 * Wrapper for async express handlers to catch async errors gracefully
 * @param fn Async express function
 */
export const asyncCatch = (
  fn: (req: Request, res: Response) => Promise<void>
) => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      await fn(req, res);
    } catch (err) {
      console.error(err);
      error(res);
    }
  };
};
