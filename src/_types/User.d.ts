import { Document, Model, Schema } from "mongoose";

/**
 * Type of User model
 */
export interface IUser extends Document {
  email: string;
  password: string;
  admin: boolean;
  name?: string;
  company?: Schema.Types.ObjectId;
  lastLogin?: number;
  createdAt: number;
  updatedAt: number;
  checkPassword: (password: string) => boolean;
  generateAuthToken: () => string;
  generatePasswordResetToken: () => string;
  generateEmailVerificationToken: () => string;
}

export interface IUserModel extends Model<IUser> {
  generateHash: (password: string) => string;
  verifyEmailVerificationToken: (token: string) => string;
  verifyPasswordResetToken: (token: string) => string;
}
