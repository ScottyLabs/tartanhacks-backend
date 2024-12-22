import { model, Schema } from "mongoose";
import {
  getProfilePictureUrl,
  getResumeUrl,
  hasProfilePicture,
} from "../services/storage";
import isProduction from "../util/isProduction";
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
import { IConfirmation } from "../_types/Confirmation";
import { IProfile } from "../_types/Profile";

/**
 * Confirmation signatures after a user is accepted into the event
 */
const Confirmation: Schema<IConfirmation> = new Schema({
  signatureLiability: {
    type: Boolean,
    required: true,
  },
  signatureCodeOfConduct: {
    type: Boolean,
    required: true,
  },
  willMentor: {
    type: Boolean,
    required: true,
    default: false,
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
    middleName: { type: String },
    lastName: { type: String, required: true },
    displayName: { type: String, required: true },
    age: { type: Number },
    school: { type: String, required: true },
    college: {
      type: String,
      enum: Object.values(CMUCollege).concat([null]),
    },
    collegeLevel: {
      type: String,
      enum: Object.values(CollegeLevel).concat([null]),
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
      required: true,
      validate: {
        validator: function (v: string) {
          return /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/.test(
            v
          );
        },
      },
    },
    major: String,
    linkedin: String,
    hackathonExperience: {
      type: String,
      enum: Object.values(HackathonExperience).concat([null]),
    },
    workPermission: {
      type: String,
      enum: Object.values(WorkPermission).concat([null]),
    },
    workLocation: String,
    workStrengths: String,
    sponsorRanking: {
      type: [Schema.Types.ObjectId],
      ref: "Sponsor",
    },
    profilePicture: String,
    resume: String,
    github: {
      type: String,
      required: true,
    },
    design: String,
    website: String,
    dietaryRestrictions: [String],
    shirtSize: {
      type: String,
      enum: Object.values(ShirtSize).concat([null]),
    },
    wantsHardware: Boolean,
    address: String,
    region: {
      type: String,
      enum: Object.values(Region).concat([null]),
    },
    wantsTravelReimbursement: {
      type: Boolean,
      default: false,
    },
    travelDetails: String,
    city: String,
    country: String,
    diversityStatement: String,
    tartanHacksCodeOfConductAcknowledgement: {
      type: Boolean,
      required: true,
    },
    tartanHacksMediaReleaseAcknowledgement: {
      type: Boolean,
      required: true,
    },
    tartanHacksMediaReleaseSignature: {
      type: String,
      required: true,
    },
    tartanHacksMediaReleaseDate: {
      type: Date,
      required: true,
    },
    mlhCodeOfConductAcknowledgement: {
      type: Boolean,
      required: true,
    },
    mlhTermsAndConditionsAcknowledgement: {
      type: Boolean,
      required: true,
    },
    mlhEmailSubscription: {
      type: Boolean,
      default: false,
    },
    confirmation: Confirmation,
    attendingPhysically: {
      type: Boolean,
      required: true,
      default: false,
    },
    notes: String,
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

Profile.methods.getResumeUrl = async function (): Promise<string> {
  const { user } = this;
  const resumeUrl = await getResumeUrl(user);
  return resumeUrl;
};

Profile.methods.getProfilePictureUrl = async function (): Promise<string> {
  const { user } = this;
  if (!hasProfilePicture(user)) {
    return null;
  }
  const profilePictureUrl = await getProfilePictureUrl(user);
  return profilePictureUrl;
};

Profile.index({ firstName: "text", lastName: "text", displayName: "text" });

export default model<IProfile>("Profile", Profile, "profiles", !isProduction);
