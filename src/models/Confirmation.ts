import { model, Schema } from "mongoose";
import isProduction from "../util/isProduction";
import { IConfirmation } from "../_types/Confirmation";

/**
 * User confirmation data
 */
const Confirmation: Schema<IConfirmation> = new Schema(
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
    signatureLiability: { type: Boolean, required: true },
    signaturePhotoRelease: { type: Boolean, required: true },
    signatureCodeOfConduct: { type: Boolean, required: true },
    mlhCodeOfConduct: { type: Boolean, required: true },
    mlhEventLogistics: { type: Boolean, required: true },
    mlhPromotional: { type: Boolean, required: true },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export default model<IConfirmation>(
  "Confirmation",
  Confirmation,
  "confirmations",
  !isProduction
);
