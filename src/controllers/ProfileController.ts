/**
 * Controller for admin routes
 */

import { Request, Response } from "express";
import { UpdateQuery } from "mongoose";
import Profile from "../models/Profile";
import { bad } from "../util/error";
import { IProfile } from "../_types/Profile";
import * as EventController from "./EventController";

/**
 * Submit a user's profile or update it if it already exists
 */
export const submitProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profileArgs = req.body as UpdateQuery<IProfile>;
    const user = res.locals.user;

    const tartanhacks = await EventController.getTartanHacks();
    const profile = await Profile.findOneAndUpdate(
      { user: user._id, event: tartanhacks._id },
      profileArgs,
      {
        upsert: true,
        returnOriginal: false,
      }
    );
    res.json(profile.toJSON());
  } catch (err) {
    console.error(err);
    return bad(res);
  }
};
