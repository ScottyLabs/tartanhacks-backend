import { Document, Schema } from "mongoose";

/**
 * Type for the Team model
 */
interface Team extends Document {
  event: Schema.Types.ObjectId;
  name: string;
  admin: string;
  members: [Schema.Types.ObjectId];
  open: boolean;
  createdAt: number;
  updatedAt: number;
}
