/**
 * Controller for admin routes
 */

import { Request, Response } from "express";
import User from "../models/User";
import { bad, error, notFound } from "../util/error";

/**
 * Make a user into an admin
 */
export const createAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (user == null) {
      return notFound(res, "User not found");
    }

    await user.updateOne(
      {
        $set: {
          admin: true,
        },
      },
      {
        returnOriginal: false,
      }
    );
    res.json(user.toJSON());
  } catch (err) {
    console.error(err);
    return error(res);
  }
};

/**
 * Demote an admin
 */
export const removeAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (id == null) {
    return bad(res, "Missing user id");
  }

  try {
    const user = await User.findById(id);
    if (user == null) {
      return notFound(res, "User not found");
    }

    if (!user.admin) {
      return bad(res, "User is not an admin");
    }

    await user.updateOne(
      {
        $set: {
          admin: false,
        },
      },
      {
        returnOriginal: false,
      }
    );
    res.json(user.toJSON());
  } catch (err) {
    console.error(err);
    return error(res);
  }
};
