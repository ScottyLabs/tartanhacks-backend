import { model, Schema } from "mongoose";
import isProduction from "../util/isProduction";
import { IStatus } from "../_types/Status";

/**
 * Status of a user in the registration process
 */
const Status: Schema<IStatus> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    verified: Boolean,
    completedProfile: Boolean,
    admitted: Boolean,
    admittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    confirmed: Boolean,
    declined: Boolean,
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export default model<IStatus>("Status", Status, "statuses", !isProduction);
