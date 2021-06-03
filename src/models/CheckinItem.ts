import { model, Schema } from "mongoose";
import { CheckinAccessLevel, ICheckinItem } from "../_types/CheckinItem";

/**
 * Checkin items, e.g. arrival, attending a workshop
 */
const CheckinItem: Schema<ICheckinItem> = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    points: { type: Number, required: true, default: 0 },
    accessLevel: {
      type: String,
      enum: Object.values(CheckinAccessLevel),
      default: CheckinAccessLevel.ALL,
      required: true,
    },
    active: { type: Boolean, required: true, default: true },
    enableSelfCheckin: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export default model("CheckinItem", CheckinItem);
