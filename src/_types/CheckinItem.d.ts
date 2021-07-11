import { Document } from "mongoose";
import * as CheckinItem from "../_enums/CheckinItem";
import { ObjectId } from "bson";

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
  accessLevel: CheckinItem.CheckinAccessLevel;
  active: boolean;
  enableSelfCheckin: boolean;
  checkinLimit?: number;
  createdAt: Date;
  updatedAt?: Date;
}
