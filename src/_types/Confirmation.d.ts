import { Document } from "mongoose";

/**
 * Type for Confirmation model
 */
export interface IConfirmation extends Document {
  signatureLiability: boolean;
  signaturePhotoRelease: boolean;
  signatureCodeOfConduct: boolean;
  mlhCodeOfConduct: boolean;
  mlhEventLogistics: boolean;
  mlhPromotional: boolean;
}
