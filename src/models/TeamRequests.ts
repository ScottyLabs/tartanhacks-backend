import { model, Schema } from "mongoose"

/**
 * Requests from users to join teams and invitations from teams to individual users
 */
const TeamRequest: Schema = new Schema({
  event: { 
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  type: { 
    type: String,
    enum: ["INVITE", "JOIN"],
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "DECLINED", "CANCELLED"],
    required: true,
    default: "PENDING"
  },
  message: String
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

export default model("TeamRequest", TeamRequest)
