import { Document } from "mongoose"

/**
 * Type for Event model
 */
export interface IEvent extends Document {
  name: string,
  website: string,
  startTime?: number,
  endTime?: number,
  enableCheckin: boolean,
  enableProjects: boolean,
  enableTeams: boolean,
  enableSponsors: boolean,
  logoUrl?: string,
  essayQuestions?: [string],
  createdAt: number,
  updatedAt: number
}

