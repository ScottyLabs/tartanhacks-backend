import { Schema, Document } from "mongoose"

/**
 * Type for Checkin Model
 */
export interface Checkin extends Document {
  event: Schema.Types.ObjectId
  user: Schema.Types.ObjectId
  item: Schema.Types.ObjectId
  createdAt: number
  updatedAt: number
}