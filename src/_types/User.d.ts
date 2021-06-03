import { Document, Schema } from "mongoose";

/**
 * Type of User model
 */
export interface User extends Document {
  email: string;
  password: string;
  admin: boolean;
  name?: string;
  company?: Schema.Types.ObjectId;
  lastLogin?: number;
  createdAt: number;
  updatedAt: number;
}
