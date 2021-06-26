import { Document, ObjectId } from "mongoose";

export enum EmailGroup {
  PARTICIPANTS_VERIFIED,
  PARTICIPANTS_COMPLETED,
  PARTICIPANTS_CONFIRMED,
  SPONSORS,
  ADMINS,
}

export enum EmailStatus {
  QUEUED,
  SENT,
  ERROR,
  DELETED,
}

/**
 * Type for Email model
 */
export interface IEmail extends Document {
  _id: ObjectId;
  event: ObjectId;
  sender: ObjectId;
  groups: [EmailGroup];
  subject: string;
  body: string;
  sendTime?: Date;
  status: EmailStatus;
  createdAt: Date;
  updatedAt?: Date;
}
