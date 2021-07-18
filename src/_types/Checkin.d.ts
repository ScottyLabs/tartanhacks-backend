import { Document } from "mongoose";
import { ObjectId } from "bson";

/**
 * Type for Checkin Model
 */
export interface ICheckin extends Document {
  _id: ObjectId;
  event: ObjectId;
  user: ObjectId;
  item: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}
