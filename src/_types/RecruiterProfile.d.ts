import { Document } from "mongoose";
import { ObjectId } from "bson";

/**
 * Type for Bookmark Model
 */
export interface IRecruiterProfile extends Document {
  _id: ObjectId;
  event: ObjectId;
  user: ObjectId;
  firstName: string;
  lastName: string;
  createdAt?: Date;
  updatedAt?: Date;
}
