import { Schema, Document } from "mongoose"

export enum ShirtSize {
  XS,
  S,
  M,
  L,
  XL,
  XXL,
  WXS,
  WS,
  WM,
  WL,
  WXL,
  WXXL,
}

export enum Region {
  RURAL, SUBURBAN, URBAN
}

/**
 * Type for Confirmation model
 */
export interface IConfirmation extends Document {
  event: Schema.Types.ObjectId
  user: Schema.Types.ObjectId
  dietaryRestrictions?: [string]
  shirtSize?: ShirtSize
  wantsHardware?: boolean
  address?: string
  region?: Region
  signatureLiability: boolean
  signaturePhotoRelease: boolean
  signatureCodeOfConduct: boolean
  mlhCodeOfConduct: boolean
  mlhEventLogistics: boolean
  mlhPromotional: boolean
  createdAt: number
  updatedAt: number
}
