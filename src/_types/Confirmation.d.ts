import { Document } from "mongoose";

/**
 * Type for Confirmation model
 */
export interface IConfirmation extends Document {
  signatureLiability: boolean;
  signatureCodeOfConduct: boolean;
  willMentor: boolean;
}
