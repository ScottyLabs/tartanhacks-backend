import { Document, ObjectId } from "mongoose";

export enum Platform {
  IN_PERSON,
  ZOOM,
  HOPIN,
  DISCORD,
  YOUTUBE,
  OTHER,
}

/**
 * Type for the ScheduleItem model
 */
export interface IScheduleItem extends Document {
  _id: ObjectId;
  event: ObjectId;
  name: string;
  startTime: Date;
  endTime: Date;
  location: string;
  lat?: number;
  lng?: number;
  platform: Platform;
  platformUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
