import { Model, model, Schema } from "mongoose"
import { IUser } from "../_types/User"

/**
 * Primary identification information for a user
 */
const UserSchema: Schema = new Schema({
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

const User: Model<IUser> = model("User", UserSchema)
export default User;
