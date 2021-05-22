import { Schema, Document } from "mongoose"

/**
 * Type for CheckinItem model
 */
export interface CheckinItem extends Document {
  event: Schema.Types.ObjectId
  name: string
  description: string
  startTime: number
  endTime: number
  points: number
  accessLevel: string
  active: boolean
  enableSelfCheckin: boolean
  createdAt: number
  updatedAt: number
}