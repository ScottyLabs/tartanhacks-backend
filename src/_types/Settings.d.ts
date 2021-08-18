import { Document } from "mongoose";
import { ObjectId } from "bson";

/**
 * Type for the Settings model
 */
export interface ISettings extends Document {
  _id: ObjectId;
  event: ObjectId;
  timeOpen?: Date;
  timeClose?: Date;
  timeConfirm?: Date;
  enableWhitelist?: number;
  whitelistedEmails?: string[];
  waitlistText?: string;
  acceptanceText?: string;
  confirmationText?: string;
  allowMinors?: boolean;
  maxTeamSize?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
