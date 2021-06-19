import { ObjectId } from "mongoose";
import User from "../models/User";
import { IUser } from "../_types/User";
import Status from "../models/Status";
import { IStatus } from "../_types/Status";
import * as EventController from "./EventController";

/**
 * Get a User by their authentication token
 * @param token authentication token
 * @returns the user associated with the login authentication token
 */
export const getByToken = async (token: string): Promise<IUser> => {
  const id = User.decryptAuthToken(token);
  const user = await User.findById(id);
  return user;
};

export const getOrCreateStatus = async (userId: ObjectId, update?: any): Promise<IStatus> => {
  const tartanhacks = await EventController.getTartanHacks();
  const status = await Status.findOneAndUpdate(
    {
      user: userId,
      event: tartanhacks._id,
    },
    {},
    {
      upsert: true,
      returnOriginal: false
    }
  );
  return status;
};

export const verifyUser = async (userId: ObjectId): Promise<void> => {
  const status = await getOrCreateStatus(userId);
  await status.update({
    $set: {
      verified: true,
    },
  });
};
