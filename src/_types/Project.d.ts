import { Document, Schema } from "mongoose";

/**
 * Type for project
 */
export interface Project extends Document {
  event: Schema.Types.ObjectId;
  name: string;
  description: string;
  url: string;
  slides?: string;
  video?: string;
  team: Schema.Types.ObjectId;
  isDeleted: boolean;
  prizes: Schema.Types.ObjectId;
  createdAt: number;
  updatedAt: number;
}
