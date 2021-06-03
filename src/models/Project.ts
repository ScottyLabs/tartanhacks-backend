import { Schema } from "mongoose";

/**
 * Type for project model
 */
interface Project {
  event: Schema.Types.ObjectId;
  name: string;
  description: string;
  url: string;
  slides?: string;
  video?: string;
  team: Schema.Types.ObjectId;
  isDeleted: boolean;
  prizes: [Schema.Types.ObjectId];
  createdAt: number;
  updatedAt: number;
}

export default Project;
