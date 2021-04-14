import { model, Schema } from "mongoose"

/**
 * A team with a single admin and other members
 */
const Team: Schema = new Schema({
  event: { 
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  name: { type: String, required: true },
  admin: { 
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: {
    type: [Schema.Types.ObjectId],
    ref: "User",
    required: true
  },
  open: { type: Boolean, required: true, default: true }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

export default model("Team", Team)
