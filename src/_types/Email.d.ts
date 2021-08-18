import { Document } from "mongoose";
import * as Email from "../_enums/Email";
import { ObjectId } from "bson";

/**
 * Type for Email model
 */
export interface IEmail extends Document {
  _id: ObjectId;
  event: ObjectId;
  sender: ObjectId;
  groups: Email.EmailGroup[];
  subject: string;
  body: string;
  sendTime?: Date;
  status: Email.EmailStatus;
  createdAt: Date;
  updatedAt?: Date;
}
