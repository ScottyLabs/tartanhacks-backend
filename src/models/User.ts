import { Model, model, Schema } from "mongoose";
import { User } from "../_types/User";
import bcrypt from "bcrypt";

/**
 * Primary identification information for a user
 */
const UserSchema: Schema = new Schema<User>(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: true, default: false },
    name: String,
    sponsor: {
      type: Schema.Types.ObjectId,
      ref: "Sponsor",
    },
    lastLogin: Number,
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

UserSchema.methods.checkPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User: Model<User> = model("User", UserSchema);
export default User;
