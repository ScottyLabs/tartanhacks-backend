import { Document, Schema } from "mongoose"

/**
 * Type for Prize model
 */
export interface Prize extends Document {
  event: Schema.Types.ObjectId
  name: string
  description: string
  eligibility?: string
  provider: Schema.Types.ObjectId
  winner?: Schema.Types.ObjectId
}
