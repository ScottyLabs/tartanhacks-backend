import { model, Schema } from "mongoose";
import { ICheckinItem } from "../_types/CheckinItem";
import { CheckinAccessLevel } from "../_enums/CheckinItem";
import isProduction from "../util/isProduction";
import { IBookmark } from "../_types/Bookmark";
import { BookmarkType } from "../_enums/BookmarkType";

/**
 * Checkin items, e.g. arrival, attending a workshop
 */
const Bookmark: Schema<IBookmark> = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    type: {
      type: String,
      enum: Object.values(BookmarkType),
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export default model<ICheckinItem>(
  "CheckinItem",
  CheckinItem,
  "checkin-items",
  !isProduction
);
