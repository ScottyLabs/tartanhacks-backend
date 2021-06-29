import { Document, ObjectId } from "mongoose";

/**
 * Type for the Status model
 */
export interface IStatus extends Document {
  _id: ObjectId;
  user: ObjectId;
  event: ObjectId;
  verified?: boolean;
  completedProfile?: boolean;
  admitted?: boolean;
  admittedBy?: ObjectId;
  confirmed?: boolean;
  declined?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
