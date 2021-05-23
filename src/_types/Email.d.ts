import { Document, Schema } from "mongoose"

export enum EmailGroup {
  PARTICIPANTS_VERIFIED,
  PARTICIPANTS_COMPLETED,
  PARTICIPANTS_CONFIRMED,
  SPONSORS,
  ADMINS
}

export enum EmailStatus {
  QUEUED,
  SENT,
  ERROR,
  DELETED,
}

/**
 * Type for Email model
 */
export interface IEmail extends Document {
  event: Schema.Types.ObjectId
  sender: Schema.Types.ObjectId
  groups: [EmailGroup]
  subject: string
  body: string
  sendTime?: number
  status: EmailStatus
  createdAt: number
  updatedAt: number
}
