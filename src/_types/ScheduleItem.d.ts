import { Document } from "mongoose";
import { ObjectId } from "bson";
import { ScheduleItemPlatform } from "../_enums/ScheduleItem";

/**
 * Type for the ScheduleItem model
 */
export interface IScheduleItem extends Document {
  _id: ObjectId;
  event: ObjectId;
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location: string;
  lat?: number;
  lng?: number;
  platform: ScheduleItemPlatform;
  platformUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
