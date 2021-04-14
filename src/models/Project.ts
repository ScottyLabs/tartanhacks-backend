import { model, Schema } from "mongoose"

/**
 * Team-submitted projects
 */
const Project: Schema = new Schema({
  event: { 
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  slides: String,
  video: String,
  team: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    required: true
  },
  isDeleted: { type: Boolean, required: true, default: false },
  prizes: {
    type: [Schema.Types.ObjectId],
    ref: "Prize",
    required: true
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

export default model("Project", Project)
