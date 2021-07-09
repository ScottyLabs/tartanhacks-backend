import { Document, ObjectId } from "mongoose";

/**
 * Type for the Team model
 */
export interface ITeam extends Document {
  _id: ObjectId;
  event: ObjectId;
  name: string;
  admin: string;
  members: [ObjectId];
  open: boolean;
  createdAt: Date;
  updatedAt: Date;
}
