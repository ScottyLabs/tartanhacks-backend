import { Document, ObjectId } from "mongoose";

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
