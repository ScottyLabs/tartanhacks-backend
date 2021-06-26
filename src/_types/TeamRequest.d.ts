import { Document, ObjectId } from "mongoose";

export enum TeamRequestType {
  INVITE,
  JOIN,
}

export enum TeamRequestStatus {
  PENDING,
  ACCEPTED,
  DECLINED,
  CANCELLED,
}

/**
 * Type for the TeamRequest model
 */
export interface ITeamRequest extends Document {
  _id: ObjectId;
  event: ObjectId;
  type: TeamRequestType;
  user: ObjectId;
  team: ObjectId;
  status: TeamRequestStatus;
  message?: string;
  createdAt: Date;
  updatedAt?: Date;
}
