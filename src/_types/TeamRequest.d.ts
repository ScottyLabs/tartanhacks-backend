import { Document, Schema } from "mongoose"

export enum TeamRequestType {
  INVITE, JOIN
}

export enum TeamRequestStatus {
  PENDING, ACCEPTED, DECLINED, CANCELLED
}

/**
 * Type for the TeamRequest model
 */
export interface ITeamRequest extends Document {
  event: Schema.Types.ObjectId,
  type: TeamRequestType,
  user: Schema.Types.ObjectId,
  team: Schema.Types.ObjectId,
  status: TeamRequestStatus,
  message?: string,
  createdAt: number,
  updatedAt: number
}
