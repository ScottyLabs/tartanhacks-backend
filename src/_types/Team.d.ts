import { Document } from "mongoose";
import { ObjectId } from "bson";

/**
 * Type for the Team model
 */
export interface ITeam extends Document {
  _id: ObjectId;
  event: ObjectId;
  name: string;
  admin: ObjectId;
  members: ObjectId[];
  open: boolean;
  createdAt: Date;
  updatedAt: Date;
}
