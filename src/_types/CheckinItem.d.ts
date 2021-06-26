import { Document, ObjectId } from "mongoose";


export enum CheckinAccessLevel {
  ALL,
  SPONSORS_ONLY,
  PARTICIPANTS_ONLY,
  ADMINS_ONLY,
}

/**
 * Type for CheckinItem model
 */
export interface ICheckinItem extends Document {
  _id: ObjectId;
  event: ObjectId;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  points: number;
  accessLevel: CheckinAccessLevel;
  active: boolean;
  enableSelfCheckin: boolean;
  checkinLimit?: number;
  createdAt: Date;
  updatedAt?: Date;
}
