import { model, Schema } from "mongoose"
import { ShirtSize, Region } from "../_types/Confirmation"

/**
 * User confirmation data
 */
const Confirmation: Schema = new Schema(
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
    dietaryRestrictions: [String],
    shirtSize: {
      type: String,
      enum: Object.values(ShirtSize)
    },
    wantsHardware: Boolean,
    address: String,
    region: {
      type: String,
      enum: Object.values(Region),
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
)

export default model("Confirmation", Confirmation)
