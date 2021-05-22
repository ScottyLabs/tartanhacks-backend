import { Document } from "mongoose"

/**
 * Type for the Settings model
 */
export interface Settings extends Document {
  timeOpen?: number
  timeClose?: number
  timeConfirm?: number
  enableWhitelist?: number
  whitelistedEmails?: [string]
  waitlistText?: string
  acceptanceText?: string
  confirmationText?: string
  allowMinors?: boolean
  createdAt: number
  updatedAt: number
}
