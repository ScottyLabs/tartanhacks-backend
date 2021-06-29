import { model, Schema } from "mongoose";
import isProduction from "../util/isProduction";
import { IScheduleItem, Platform } from "../_types/ScheduleItem";

/**
 * Schedule items for (potential) dynamic scheduling support
 */
const ScheduleItem: Schema<IScheduleItem> = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    location: { type: String, required: true },
    lat: Number,
    lng: Number,
    platform: {
      type: String,
      enum: Object.values(Platform),
      default: Platform.IN_PERSON,
      required: true,
    },
    platformUrl: String,
    active: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export default model<IScheduleItem>(
  "ScheduleItem",
  ScheduleItem,
  "schedule-items",
  !isProduction
);
