import { Document, Model } from "mongoose";
import { ObjectId } from "bson";

/**
 * Type of User model
 */
export interface IUser extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  admin: boolean;
  name?: string;
  company?: ObjectId;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  /**
   * Check if a password matches the stored hash
   * @param password password to verify
   */
  checkPassword: (password: string) => boolean;
  /**
   * Generate an authentication token for logging in without a password
   */
  generateAuthToken: () => string;
  /**
   * Generate a password reset token to change passwords
   */
  generatePasswordResetToken: () => string;
  /**
   * Generate an email verification token for this account
   */
  generateEmailVerificationToken: () => string;
}

export interface IUserModel extends Model<IUser> {
  /**
   * Generate the hash of a password
   * @param password Password to hash
   */
  generateHash: (password: string) => string;
  /**
   * Decrypt an authentication token
   * @param token login authentication token
   * @returns the `_id` associated with the User document
   */
  decryptAuthToken: (token: string) => string;
  /**
   * Decrypt a password reset token
   * @param token password reset token to use
   * @return the `_id` associated with the User document
   */
  decryptEmailVerificationToken: (token: string) => string;
  /**
   * Decrypt an email verification token
   * @param token email verification token to use
   * @return the `email` associated with the User document
   */
  decryptPasswordResetToken: (token: string) => string;
}
