import { Model, model, Schema } from "mongoose";
import { IUser, IUserModel } from "../_types/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Time before the generated JWT tokens expire
 */
const PASSWORD_RESET_EXPIRY = "1 hour";
const EMAIL_TOKEN_EXPIRY = "1 hour";

/**
 * Identification information for a user
 */
const User: Schema<IUser> = new Schema(
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

/**
 * Check if a password matches the stored hash
 * @param password password to verify
 */
User.methods.checkPassword = function (password: string): boolean {
  return bcrypt.compareSync(password, this.password);
};

/**
 * Generate an authentication token for logging in
 */
User.methods.generateAuthToken = function (): string {
  return jwt.sign(this._id, process.env.JWT_SECRET, {
    expiresIn: process.env.AUTH_TOKEN_EXPIRY,
  });
};

/**
 * Generate a password reset token to change passwords
 */
User.methods.generatePasswordResetToken = function (): string {
  return jwt.sign(this._id, process.env.JWT_SECRET, {
    expiresIn: PASSWORD_RESET_EXPIRY,
  });
};

/**
 * Generate an email verification token for this account
 */
User.methods.generateEmailVerificationToken = function (): string {
  return jwt.sign(this.email, process.env.JWT_SECRET, {
    expiresIn: EMAIL_TOKEN_EXPIRY,
  });
};

/**
 * Generate the hash of a password
 * @param password Password to hash
 */
User.statics.generateHash = (password: string): string => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

/**
 * Check if an email verification token is valid for this user
 * @param token email verification token to check
 */
User.statics.verifyEmailVerificationToken = function (token: string): string {
  return jwt.verify(token, process.env.JWT_SECRET).toString();
};

/**
 * Check if a password reset token is valid for this user
 * @param token password reset token to check
 */
User.statics.verifyPasswordResetToken = (token: string): string => {
  return jwt.verify(token, process.env.JWT_SECRET).toString();
};

export default model<IUser, IUserModel>("User", User);
