import { Document } from "mongoose";
import { ObjectId } from "bson";

/**
 * Type for Bookmark Model
 */
export interface IBookmark extends Document {
  _id: ObjectId;
  event: ObjectId;
  user: ObjectId;
  participant: ObjectId;
  project: ObjectId;
  type: ObjectId;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}
