import { ObjectId } from "mongoose";
import User from "../models/User";
import { IUser } from "../_types/User";
import Status from "../models/Status";
import { IStatus } from "../_types/Status";
import * as EventController from "./EventController";
import { UpdateQuery } from "mongoose";

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

/**
 * Get the status object associated with a user or create one if it does not
 * yet exist
 * @param userId The id of the user to associated with this status
 * @param update an optional update to apply to the status
 * @returns the Status document
 */
export const getStatus = async (
  userId: ObjectId,
  update: UpdateQuery<IStatus> = {}
): Promise<IStatus> => {
  const tartanhacks = await EventController.getTartanHacks();
  const status = await Status.findOneAndUpdate(
    {
      user: userId,
      event: tartanhacks._id,
    },
    update,
    {
      upsert: true,
      returnOriginal: false,
    }
  );
  return status;
};

/**
 * Set a user's status as verified
 * @param userId id of the User to check
 */
export const verifyUser = async (userId: ObjectId): Promise<void> => {
  await getStatus(userId, {
    $set: {
      verified: true,
    },
  });
};