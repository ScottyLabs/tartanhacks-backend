import { Document } from "mongoose";
import { ObjectId } from "bson";

/**
 * Type for project
 */
export interface IProject extends Document {
  _id: ObjectId;
  event: ObjectId;
  name: string;
  description: string;
  url: string;
  slides?: string;
  video?: string;
  team: ObjectId;
  prizes: ObjectId[];
  createdAt: Date;
  updatedAt?: Date;
}
