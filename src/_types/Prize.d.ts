import { Document, ObjectId } from "mongoose";

/**
 * Type for Prize model
 */
export interface IPrize extends Document {
  _id: ObjectId;
  event: ObjectId;
  name: string;
  description: string;
  eligibility?: string;
  provider: ObjectId;
  winner?: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}
