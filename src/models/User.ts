import { model, Schema } from "mongoose"

/**
 * Primary identification information for a user
 */
const User: Schema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  admin: { type: Boolean, required: true, default: false },
  name: String,
  sponsor: {
    type: Schema.Types.ObjectId,
    ref: "Sponsor"
  },
  lastLogin: Number
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

export default model("User", User)
