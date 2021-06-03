import { Document, Schema } from "mongoose";

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
  event: Schema.Types.ObjectId;
  name: string;
  startTime: number;
  endTime: number;
  location: string;
  lat?: number;
  lng?: number;
  platform: Platform;
  platformUrl?: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}
