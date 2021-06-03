import { model, Schema } from "mongoose";

/**
 * Status of a user in the registration process
 */
const Status: Schema = new Schema(
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

export default model("Status", Status);
