import { Schema, Document } from "mongoose"

export enum CheckinAccessLevel {
  ALL,
  SPONSORS_ONLY,
  PARTICIPANTS_ONLY,
  ADMINS_ONLY,
}

/**
 * Type for CheckinItem model
 */
export interface ICheckinItem extends Document {
  event: Schema.Types.ObjectId
  name: string
  description: string
  startTime: number
  endTime: number
  points: number
  accessLevel: CheckinAccessLevel
  active: boolean
  enableSelfCheckin: boolean
  createdAt: number
  updatedAt: number
}
