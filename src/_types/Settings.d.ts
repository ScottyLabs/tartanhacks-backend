import { Document, ObjectId } from "mongoose";

/**
 * Type for the Settings model
 */
export interface ISettings extends Document {
  _id: ObjectId;
  timeOpen?: Date;
  timeClose?: Date;
  timeConfirm?: Date;
  enableWhitelist?: number;
  whitelistedEmails?: [string];
  waitlistText?: string;
  acceptanceText?: string;
  confirmationText?: string;
  allowMinors?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
