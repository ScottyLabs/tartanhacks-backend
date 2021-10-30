import { model, Schema } from "mongoose";
import isProduction from "../util/isProduction";
import { IConfirmation } from "../_types/Confirmation";
import {
  CMUCollege,
  CollegeLevel,
  Ethnicity,
  Gender,
  HackathonExperience,
  Region,
  ShirtSize,
  WorkPermission,
} from "../_enums/Profile";
import { IProfile } from "../_types/Profile";

/**
 * Confirmation signatures after a user is accepted into the event
 */
const Confirmation: Schema<IConfirmation> = new Schema({
  signatureLiability: {
    type: Boolean,
    required: true,
  },
  signaturePhotoRelease: {
    type: Boolean,
    required: true,
  },
  signatureCodeOfConduct: {
    type: Boolean,
    required: true,
  },
  mlhCodeOfConduct: {
    type: Boolean,
    required: true,
  },
  mlhEventLogistics: {
    type: Boolean,
    required: true,
  },
  mlhPromotional: {
    type: Boolean,
    required: true,
  },
});

/**
 * Public user profile data
 */
const Profile: Schema<IProfile> = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    displayName: { type: String, required: true },
    age: { type: Number, required: true },
    school: { type: String, required: true },
    college: {
      type: String,
      enum: Object.values(CMUCollege),
    },
    level: {
      type: String,
      enum: Object.values(CollegeLevel),
    },
    graduationYear: {
      type: Number,
      minimum: 2022,
      maximum: 2027,
      required: true,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      required: true,
    },
    genderOther: String,
    ethnicity: {
      type: String,
      enum: Object.values(Ethnicity),
      required: true,
    },
    totalPoints: { type: Number, default: 0 },
    ethnicityOther: String,
    phoneNumber: {
      type: String,
      required: function () {
        /*
      Matches the following formats:
      123-456-7890
      (123) 456-7890
      123 456 7890
      123.456.7890
      +91 (123) 456-7890
      1234567890
      */
        return this.phoneNumber.match(
          /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
        );
      },
    },
    major: String,
    coursework: String,
    languages: String,
    hackathonExperience: {
      type: String,
      enum: Object.values(HackathonExperience),
    },
    workPermission: {
      type: String,
      enum: Object.values(WorkPermission),
    },
    workLocation: String,
    workStrengths: String,
    sponsorRanking: {
      type: [Schema.Types.ObjectId],
      ref: "Sponsor",
    },
    resume: String,
    github: {
      type: String,
      required: true,
    },
    design: String,
    website: String,
    essays: [String],
    dietaryRestrictions: [String],
    shirtSize: {
      type: String,
      enum: Object.values(ShirtSize),
    },
    wantsHardware: Boolean,
    address: String,
    region: {
      type: String,
      enum: Object.values(Region),
    },
    confirmation: Confirmation,
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    toJSON: {
      // Remove password field when getting json of user
      transform: (doc, ret, options) => {
        ret.resume = `https://drive.google.com/file/d/${ret.resume}`;
        return ret;
      },
    },
  }
);

export default model<IProfile>("Profile", Profile, "profiles", !isProduction);
