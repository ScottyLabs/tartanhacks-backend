import { NextFunction, Request, Response } from "express";
import { getByToken } from "../controllers/UserController";
import { bad, error, unauthorized } from "../util/error";
import CheckinItem from "../models/CheckinItem";
import { findUserTeam } from "../controllers/TeamController";
import Project from "../models/Project";
import Checkin from "../models/Checkin";
import User from "src/models/User";

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
  if (!token) {
    return unauthorized(res);
  }
  try {
    const user = await getByToken(token);
    if (!user) {
      unauthorized(res);
    } else {
      res.locals.user = user;
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
  if (!token) {
    return unauthorized(res);
  }
  try {
    const user = await getByToken(token);
    if (user?.admin) {
      res.locals.user = user;
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
  if (!token) {
    return unauthorized(res);
  }
  const { id } = req.params;
  if (!id) {
    return bad(res);
  }

  try {
    const user = await getByToken(token);
    if (user?.admin || user._id.toString() === id) {
      res.locals.user = user;
      return next();
    } else {
      unauthorized(res);
    }
  } catch (err) {
    return error(res, err);
  }
};

/**
 * Middleware to check if a user is the owner, recruiter, or admin (based on the param ID)
 * Continues if true. Otherwise, errors with 403
 */
export const isOwnerRecruiterOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  if (!token) {
    return unauthorized(res);
  }
  const { id } = req.params;
  if (!id) {
    return bad(res);
  }

  try {
    const user = await getByToken(token);
    if (user?.admin || user?.company || user._id.toString() === id) {
      res.locals.user = user;
      return next();
    } else {
      unauthorized(res);
    }
  } catch (err) {
    return error(res, err);
  }
};

/**
 * Middleware to check if a user is a recruiter or admin
 * Continues if true. Otherwise, errors with 403
 */
export const isRecruiterOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  if (!token) {
    return unauthorized(res);
  }

  try {
    const user = await getByToken(token);
    if (user?.admin || user?.company) {
      res.locals.user = user;
      return next();
    } else {
      unauthorized(res);
    }
  } catch (err) {
    return error(res, err);
  }
};

//Middleware function to check if the user can access data associated with a project.
export const isProjectOwnerOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  if (!token) {
    return unauthorized(res);
  }

  const { id } = req.params;
  if (!id) {
    return bad(res);
  }

  try {
    const user = await getByToken(token);
    const team = await findUserTeam(user._id);
    const project = await Project.findById(id);

    if (user?.admin || team._id === project.team) {
      res.locals.user = user;
      return next();
    } else {
      unauthorized(res);
    }
  } catch (err) {
    console.error(err);
    return error(res, err);
  }
};

export const canCheckIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  if (!token) {
    return unauthorized(res);
  }
  const checkInItemID = req.query.checkInItemID;
  const userID = req.query.userID;

  if (!checkInItemID || !userID) {
    return bad(res);
  }

  try {
    const user = await getByToken(token);
    const checkInItem = await CheckinItem.findById(checkInItemID);
    const checkInUser = await User.findById(userID);

    if (
      user?.admin ||
      (checkInItem?.enableSelfCheckin && user._id.toString() === userID)
    ) {
      //Check if user has already been checked in for this item
      const prevCheckIn = await Checkin.findOne({
        user: checkInUser._id,
        item: checkInItem._id,
      });
      if (prevCheckIn) {
        return bad(res, "This user has already been checked in for this item.");
      }

      res.locals.user = user;
      return next();
    } else {
      unauthorized(res);
    }
  } catch (err) {
    return error(res, err);
  }
};
