import { Document, Schema } from "mongoose";

/**
 * Type for the Status model
 */
interface Status extends Document {
  user: Schema.Types.ObjectId;
  event: Schema.Types.ObjectId;
  verified?: boolean;
  completedProfile?: boolean;
  admitted?: boolean;
  admittedBy?: Schema.Types.ObjectId;
  confirmed: boolean;
  declined: boolean;
  createdAt: number;
  updatedAt: number;
}
