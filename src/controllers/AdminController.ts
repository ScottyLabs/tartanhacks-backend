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
    console.log("Looking for user:", id);
    const user = await User.findById(id);
    if (user == null) {
      return notFound(res, "User not found");
    }

    console.log("Found user", user._id);

    const updatedUser = await user.updateOne(
      {
        $set: {
          admin: true,
        },
      },
      {
        returnOriginal: false,
      }
    );
    const json = updatedUser.toJSON();
    res.json({ ...json });
  } catch (err) {
    console.error(err);
    return error(res);
  }
};
