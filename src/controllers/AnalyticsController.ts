/**
 * Controller for analytics routes
 */

import { Request, Response } from "express";
import { error } from "../util/error";
import { computeAnalytics } from "../services/analytics";

export const getAnalytics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await computeAnalytics();
    res.json(stats);
  } catch (err) {
    console.error(err);
    return error(res);
  }
};
