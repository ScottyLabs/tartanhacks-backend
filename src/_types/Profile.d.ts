import { Document } from "mongoose";
import { ObjectId } from "bson";
import { IConfirmation } from "./Confirmation";
import * as Profile from "../_enums/Profile";

/**
 * Type for the profile model
 */
export interface IProfile extends Document {
  _id: ObjectId;
  event: ObjectId;
  user: ObjectId;
  firstName: string;
  lastName: string;
  displayName?: string;
  age: number;
  school: string;
  college?: Profile.CMUCollege;
  level?: Profile.CollegeLevel;
  graduationYear: number;
  gender: Profile.Gender;
  genderOther?: string;
  ethnicity: Profile.Ethnicity;
  ethnicityOther?: string;
  phoneNumber: string;
  major?: string;
  coursework?: string;
  languages?: string;
  hackathonExperience?: Profile.HackathonExperience;
  workPermission?: Profile.WorkPermission;
  workLocation?: string;
  workStrengths?: string;
  sponsorRanking?: ObjectId[];
  resume?: string;
  github: string;
  design?: string;
  website?: string;
  essays?: string[];
  dietaryRestrictions?: string[];
  shirtSize?: Profile.ShirtSize;
  wantsHardware?: boolean;
  address?: string;
  region?: Profile.Region;
  confirmation?: IConfirmation;
  createdAt: Date;
  updatedAt?: Date;
  totalPoints: number;
}
