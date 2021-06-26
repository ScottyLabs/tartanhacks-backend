import { Document, ObjectId } from "mongoose";

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
  isDeleted: boolean;
  prizes: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}
