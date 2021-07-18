import { Document } from "mongoose";
import { ObjectId } from "bson";

/**
 * Type for Event model
 */
export interface IEvent extends Document {
  _id: ObjectId;
  name: string;
  website: string;
  startTime?: Date;
  endTime?: Date;
  enableCheckin: boolean;
  enableProjects: boolean;
  enableTeams: boolean;
  enableSponsors: boolean;
  logoUrl?: string;
  essayQuestions?: string[];
  createdAt: Date;
  updatedAt?: Date;
}
