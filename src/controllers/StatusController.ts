import { ObjectId } from "bson";
import User from "../models/User";
import { IUser } from "../_types/User";
import Status from "../models/Status";
import { IStatus } from "../_types/Status";
import { StatusField } from "../_enums/Status";
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
 * @param userId The id of the user associated with this status
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
    {
      ...update,
      updatedAt: new Date(),
    },
    {
      upsert: true,
      returnOriginal: false,
    }
  );
  return status;
};

/**
 * Update the status of a user (except for admission which requires authorizer)
 * @param userId id of user to update
 * @param field field in status to update
 * @param value value to set in field
 */
export const updateStatus = async (
  userId: ObjectId,
  field: StatusField,
  value: boolean
): Promise<void> => {
  const updateObject: Partial<IStatus> = {};
  updateObject[field] = value;

  await getStatus(userId, {
    $set: updateObject,
  });
};

/**
 * Update a user's status after being admitted to the event
 * @param userId id of the User to update
 * @param admitterId id of the User admitting userId
 */
export const setAdmitted = async (
  userId: ObjectId,
  admitterId: ObjectId,
  admitted = true
): Promise<void> => {
  await getStatus(userId, {
    $set: {
      admitted,
      admittedBy: admitterId,
    },
  });
};
