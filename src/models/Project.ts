import { model, Schema } from "mongoose"

/**
 * Type for project model
 */
interface Project {
  event: Schema.Types.ObjectId,
  name: String,
  description: String,
  url: String,
  slides?: String,
  video?: String,
  team: Schema.Types.ObjectId,
  isDeleted: Boolean,
  prizes: [Schema.Types.ObjectId],
  createdAt: Number,
  updatedAt: Number
}

export default Project
