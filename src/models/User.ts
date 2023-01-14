import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { model, Schema } from "mongoose";
import { IUser, IUserModel } from "../_types/User";
import isProduction from "../util/isProduction";
import { doesStatusImply, getStatusLevel, Status } from "../_enums/Status";

/**
 * Time before the generated JWT tokens expire
 */
const AUTH_TOKEN_EXPIRY = process.env.AUTH_TOKEN_EXPIRY || "30d";
const PASSWORD_RESET_EXPIRY = process.env.PASSWORD_RESET_EXPIRY || "24h";
const EMAIL_TOKEN_EXPIRY = process.env.EMAIL_TOKEN_EXPIRY || "24h";

/**
 * Verification code length and expiry
 */
const VERIFICATION_CODE_LENGTH =
  parseInt(process.env.VERIFICATION_CODE_LENGTH) || 8;
const VERIFICATION_CODE_EXPIRY =
  parseInt(process.env.VERIFICATION_CODE_EXPIRY) || 10 * 60 * 1000;

/**
 * Identification information for a user
 */
const User: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: true, default: false },
    judge: { type: Boolean, required: true, default: false },
    name: String,
    company: {
      type: Schema.Types.ObjectId,
      ref: "Sponsor",
      default: null,
    },
    lastLogin: Number,
    verificationCode: String,
    verificationExpiry: Schema.Types.Date,
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.UNVERIFIED,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    toJSON: {
      // Remove password field when getting json of user
      transform: (doc, ret, options) => {
        delete ret.password;
        delete ret.verificationCode;
        delete ret.verificationExpiry;
        return ret;
      },
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
 * Generate an authentication token for logging in without a password
 */
User.methods.generateAuthToken = function (): string {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: AUTH_TOKEN_EXPIRY,
  });
};

/**
 * Generate a password reset token to change passwords
 */
User.methods.generatePasswordResetToken = function (): string {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: PASSWORD_RESET_EXPIRY,
  });
};

/**
 * Generate an email verification token for this account
 */
User.methods.generateEmailVerificationToken = function (): string {
  return jwt.sign({ email: this.email }, process.env.JWT_SECRET, {
    expiresIn: EMAIL_TOKEN_EXPIRY,
  });
};

/**
 * Update a user with a new verification code
 */
User.methods.updateVerificationCode = function (): Promise<IUser> {
  const newCode = crypto
    .randomBytes((VERIFICATION_CODE_LENGTH * 3) / 4)
    .toString("base64");

  this.verificationCode = newCode;
  this.verificationExpiry = new Date(
    Number(new Date()) + VERIFICATION_CODE_EXPIRY
  );
  return this.save();
};

/**
 * Returns true if the user has the specified status or a status with a greater level
 * @see getStatusLevel
 */
User.methods.hasStatus = function (status: Status): boolean {
  return doesStatusImply(this.status, status);
};

/**
 * Updates the User's status as specified
 * @throws {Error} if the specified status level is less than or equal to the current status level
 * @see getStatusLevel
 */
User.methods.setStatus = async function (status: Status): Promise<void> {
  const statusLevel = getStatusLevel(status);
  const userStatusLevel = getStatusLevel(this.status);

  if (userStatusLevel >= statusLevel) {
    throw new Error(
      `Cannot revert status! Attempting to go backwards from ${this.status} to ${status}`
    );
  }

  return this.updateOne({ status });
};

/**
 * Generate the hash of a password
 * @param password Password to hash
 */
User.statics.generateHash = (password: string): string => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

/**
 * Decrypt an authentication token
 * @param token login authentication token
 * @returns the `_id` associated with the User document
 * @throws {TokenExpiredError} if the token is expired
 * @throws {JSONWebTokenError} if the token is malformed or invalid
 */
User.statics.decryptAuthToken = (token: string): string => {
  const decrypted = jwt.verify(token, process.env.JWT_SECRET) as IUser;
  return decrypted._id.toString();
};

/**
 * Decrypt a password reset token
 * @param token password reset token to use
 * @return the `_id` associated with the User document
 * @throws {TokenExpiredError} if the token is expired
 * @throws {JSONWebTokenError} if the token is malformed or invalid
 */
User.statics.decryptPasswordResetToken = (token: string): string => {
  const decrypted = jwt.verify(token, process.env.JWT_SECRET) as IUser;
  return decrypted._id.toString();
};

/**
 * Decrypt an email verification token
 * @param token email verification token to use
 * @return the email associated with this token
 * @throws {TokenExpiredError} if the token is expired
 * @throws {JSONWebTokenError} if the token is malformed or invalid
 */
User.statics.decryptEmailVerificationToken = (token: string): string => {
  const decrypted = jwt.verify(token, process.env.JWT_SECRET) as IUser;
  return decrypted.email;
};

export default model<IUser, IUserModel>("User", User, "users", !isProduction);
