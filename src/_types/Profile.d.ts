import { Document, Schema } from "mongoose";

export enum CMUCollege {
  SCS = "SCS",
  CIT = "CIT",
  CFA = "CFA",
  DIETRICH = "Dietrich",
  MCS = "MCS",
  TEPPER = "Tepper",
  HEINZ = "Heinz",
}

export enum CollegeLevel {
  UNDERGRADUATE = "Undergraduate",
  MASTERS = "Masters",
  DOCTORATE = "Doctorate",
  OTHER = "Other",
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  PREFER_NOT_TO_SAY = "Prefer not to say",
  OTHER = "Other",
}

export enum Ethnicity {
  NATIVE_AMERICAN = "Native American",
  ASIAN = "Asian",
  BLACK = "Black",
  PACIFIC_ISLANDER = "Pacific Islander",
  WHITE = "White",
  HISPANIC = "Hispanic",
  OTHER = "Other",
}

export enum HackathonExperience {
  ZERO = "0",
  ONE_TO_THREE = "0-3",
  FOUR_PLUS = "4+",
}

export enum WorkPermission {
  CITIZEN = "Citizen",
  SPONSORSHIP = "Sponsorship",
  NO_SPONSORSHIP = "No sponsorship",
}

/**
 * Type for the profile model
 */
export interface Profile extends Document {
  event: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  age: number;
  school: string;
  college?: CMUCollege;
  level?: CollegeLevel;
  graduationYear: number;
  gender: Gender;
  genderOther?: string;
  ethnicity: Ethnicity;
  ethnicityOther?: string;
  phoneNumber: string;
  major?: string;
  coursework?: string;
  languages?: string;
  hackathonExperience?: HackathonExperience;
  workPermission?: WorkPermission;
  workLocation?: string;
  workStrengths?: string;
  sponsorRanking?: [Schema.Types.ObjectId];
  resume?: string;
  github: string;
  design?: string;
  website?: string;
  essays?: [string];
  createdAt: number;
  updatedAt: number;
}
