import { NextFunction, Request, Response } from "express";
import { getByToken } from "../controllers/UserController";
import { error, unauthorized } from "../util/error";

/**
 * Middleware to check if a user is logged in and authenticated.
 * Errors with 403 otherwise
 */
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  try {
    const user = await getByToken(token);
    if (!user) {
      unauthorized(res);
    } else {
      req.user = user;
      return next();
    }
  } catch (err) {
    return error(res, err);
  }
};

/**
 * Middleware to check if a user is an admin.
 * Continues if the user is an admin. Otherwise, errors with 403
 */
export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  try {
    const user = await getByToken(token);
    if (user?.admin) {
      req.user = user;
      return next();
    } else {
      unauthorized(res);
    }
  } catch (err) {
    return error(res, err);
  }
};

/**
 * Middleware to check if a user is an admin or the owner (based on the param ID)
 * Continues if the user is the owner or an admin. Otherwise, errors with 403
 */
export const isOwnerOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  const { id } = req.params;

  try {
    const user = await getByToken(token);
    if (user?.admin || user._id === id) {
      req.user = user;
      return next();
    } else {
      unauthorized(res);
    }
  } catch (err) {
    return error(res, err);
  }
};
