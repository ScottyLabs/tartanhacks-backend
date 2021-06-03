import { Document, Schema } from "mongoose";

/**
 * Type for the Sponsor model
 */
export interface Sponsor extends Document {
  name: string;
  event: Schema.Types.ObjectId;
  representatives: [Schema.Types.ObjectId];
  createdAt: number;
  updatedAt: number;
}
