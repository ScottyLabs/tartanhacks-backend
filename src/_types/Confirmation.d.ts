import { Schema, Document } from "mongoose"

/**
 * Type for Confirmation model
 */
export interface Confirmation extends Document {
  event: Schema.Types.ObjectId
  user: Schema.Types.ObjectId
  dietaryRestrictions?: [string]
  shirtSize?: string
  wantsHardware?: boolean
  address?: string
  region?: string
  signatureLiability: boolean
  signaturePhotoRelease: boolean
  signatureCodeOfConduct: boolean
  mlhCodeOfConduct: boolean
  mlhEventLogistics: boolean
  mlhPromotional: boolean
  createdAt: number
  updatedAt: number
}