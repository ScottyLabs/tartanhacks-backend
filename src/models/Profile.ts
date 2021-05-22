import { model, Schema } from "mongoose"

/**
 * Public user profile data
 */
const Profile: Schema = new Schema({
  event: { 
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  school: { type: String, required: true },
  college: {
    type: String,
    enum: ["SCS", "CIT", "CFA", "Dietrich", "MCS", "Tepper", "Heinz"]
  },
  level: {
    type: String,
    enum: ["Undergraduate", "Masters", "Doctorate", "Other"]
  },
  graduationYear: {
    type: Number,
    minimum: 2022,
    maximum: 2027,
    required: true
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other", "Prefer not to say"],
    required: true
  },
  genderOther: String,
  ethnicity: {
    type: String,
    enum: ["Native American", "Asian", "Black", "Pacific Islander", "White", "Hispanic", "Other" ],
    required: true
  },
  ethnicityOther: String,
  phoneNumber: {
    type: String,
    required: function() {
      /*
      Matches the following formats:
      123-456-7890
      (123) 456-7890
      123 456 7890
      123.456.7890
      +91 (123) 456-7890
      1234567890
      */
      return this.phoneNumber.match(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/)
    }
  },
  major: String,
  coursework: String,
  languages: String,
  hackathonExperience: {
    type: String,
    enum: ["0", "1-3", "4+"]
  },
  workPermission: {
    type: String,
    enum: ["citizen", "sponsorship", "no sponsorship"]
  },
  workLocation: String,
  workStrengths: String,
  sponsorRanking: {
    type: [Schema.Types.ObjectId],
    ref: "Sponsor"
  },
  resume: String,
  github: {
    type: String,
    required: true
  },
  design: String,
  website: String,
  essays: [String]
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

export default model("Profile", Profile)
