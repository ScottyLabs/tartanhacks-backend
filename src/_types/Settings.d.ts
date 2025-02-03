import { Document } from "mongoose";
import { ObjectId } from "bson";

/**
 * Type for the Settings model
 */
export interface ISettings extends Document {
  _id: ObjectId;
  event: ObjectId;
  timeOpen?: string;
  timeClose?: string;
  timeConfirm?: string;
  expoStartTime?: Date;
  submissionDeadline?: Date;
  enableWhitelist?: number;
  whitelistedEmails?: string[];
  maxParticipants?: number;
  autoWaitlist?: boolean;
  waitlistText?: string;
  acceptanceText?: string;
  confirmationText?: string;
  allowMinors?: boolean;
  maxTeamSize?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
