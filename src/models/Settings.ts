import { model, Schema } from "mongoose";
import { ISettings } from "../_types/Settings";

/**
 * Global application-wide settings
 */
const Settings: Schema<ISettings> = new Schema(
  {
    timeOpen: Number,
    timeClose: Number,
    timeConfirm: Number,
    enableWhitelist: Boolean,
    whitelistedEmails: [String],
    waitlistText: String,
    acceptanceText: String,
    confirmationText: String,
    allowMinors: Boolean,
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export default model("Settings", Settings);
