import { model, Schema } from "mongoose";
import isProduction from "../util/isProduction";
import { ISettings } from "../_types/Settings";

/**
 * Global application-wide settings
 */
const Settings: Schema<ISettings> = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    timeOpen: Date,
    timeClose: Date,
    timeConfirm: Date,
    expoStartTime: Number,
    submissionDeadline: Number,
    whitelistedEmails: [String],
    maxParticipants: Number,
    autoWaitlist: Boolean,
    waitlistText: String,
    acceptanceText: String,
    confirmationText: String,
    allowMinors: Boolean,
    maxTeamSize: Number,
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export default model<ISettings>(
  "Settings",
  Settings,
  "settings",
  !isProduction
);
