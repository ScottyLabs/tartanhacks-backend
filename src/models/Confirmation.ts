import { model, Schema } from "mongoose"

/**
 * User confirmation data
 */
const Confirmation: Schema = new Schema({
  event: { 
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  dietaryRestrictions: [String],
  shirtSize: {
    type: String,
    enum: "XS S M L XL XXL WXS WS WM WL WXL WXXL".split(" ")
  },
  wantsHardware: Boolean,
  address: String,
  region: {
    type: String,
    enum: ["RURAL", "SUBURBAN", "URBAN"]
  },
  signatureLiability: { type: Boolean, required: true },
  signaturePhotoRelease: { type: Boolean, required: true },
  signatureCodeOfConduct: { type: Boolean, required: true },
  mlhCodeOfConduct: { type: Boolean, required: true },
  mlhEventLogistics: { type: Boolean, required: true },
  mlhPromotional: { type: Boolean, required: true }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

export default model("Confirmation", Confirmation)
