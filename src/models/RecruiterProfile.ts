import { model, Schema } from "mongoose";
import { IRecruiterProfile } from "../_types/RecruiterProfile";
import isProduction from "../util/isProduction";

/**
 * Recruiter profiles are special profiles with less required information,
 * just for recruiters
 */
const RecruiterProfile: Schema<IRecruiterProfile> = new Schema(
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
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export default model<IRecruiterProfile>(
  "RecruiterProfile",
  RecruiterProfile,
  "recruiter-profiles",
  !isProduction
);
