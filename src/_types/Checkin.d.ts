import { Schema, Document } from "mongoose";

/**
 * Type for Checkin Model
 */
export interface ICheckin extends Document {
  event: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  item: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}
