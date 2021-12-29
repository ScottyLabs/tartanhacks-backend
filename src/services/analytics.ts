/**
 * Service for computing user analytics
 */

import { getParticipantDataPipeline } from "../aggregations/analytics";
import { getTartanHacks } from "../controllers/EventController";
import User from "../models/User";

type Stats = {
  total: number;
  demographic: {
    gender: Record<string, number>;
    schools: Record<
      string,
      {
        submitted: number;
        admitted: number;
        confirmed: number;
        declined: number;
      }
    >;
    colleges: Record<string, number>;
    year: Record<string, number>;
  };

  verified: number;
  submitted: number;
  admitted: number;
  confirmed: number;
  confirmedCmu: number;
  declined: number;

  confirmedFemale: number;
  confirmedMale: number;
  confirmedOther: number;
  confirmedNone: number;

  shirtSizes: Record<string, number>;

  dietaryRestrictions: Record<string, number>;

  experiences: Record<string, number>;
  wantsHardware: number;
};

export const computeAnalytics = async (): Promise<Stats> => {
  const tartanhacks = await getTartanHacks();
  const pipeline = getParticipantDataPipeline(tartanhacks._id);
  const stats: Stats = {
    total: 0,
    demographic: {
      gender: {},
      schools: {},
      year: {},
      colleges: {},
    },

    verified: 0,
    submitted: 0,
    admitted: 0,
    confirmed: 0,
    confirmedCmu: 0,
    declined: 0,

    confirmedFemale: 0,
    confirmedMale: 0,
    confirmedOther: 0,
    confirmedNone: 0,

    shirtSizes: {},

    dietaryRestrictions: {},

    experiences: {},
    wantsHardware: 0,
  };

  try {
    const participants = await User.aggregate(pipeline);
    for (const user of participants) {
      const { status, profile } = user;

      stats.total += 1;

      // Grab the email extension
      const email = user.email.split("@")[1];
      const isCMU = email === "andrew.cmu.edu" || email === "cmu.edu";

      if (!status) {
        continue;
      }

      // Count verified
      stats.verified += status.verified ? 1 : 0;

      // Count submitted
      stats.submitted += status.completedProfile ? 1 : 0;

      // Count accepted
      stats.admitted += status.admitted ? 1 : 0;

      // Count confirmed
      stats.confirmed += status.confirmed ? 1 : 0;

      // Count declined
      stats.declined += status.declined ? 1 : 0;

      // Count confirmed that are CMU
      stats.confirmedCmu += status.confirmed && isCMU ? 1 : 0;

      if (!profile) {
        continue;
      }

      /// Add to the gender
      if (profile.gender in stats.demographic.gender) {
        stats.demographic.gender[profile.gender] += 1;
      } else {
        stats.demographic.gender[profile.gender] = 1;
      }

      stats.confirmedFemale +=
        status.confirmed && profile.gender == "Female" ? 1 : 0;
      stats.confirmedMale +=
        status.confirmed && profile.gender == "Male" ? 1 : 0;
      stats.confirmedOther +=
        status.confirmed && profile.gender == "Other" ? 1 : 0;
      stats.confirmedNone +=
        status.confirmed && profile.gender == "Prefer not to say" ? 1 : 0;

      // Count the number of people who want hardware
      stats.wantsHardware += profile.wantsHardware ? 1 : 0;

      // Count schools
      if (!stats.demographic.schools[email]) {
        stats.demographic.schools[email] = {
          submitted: 0,
          admitted: 0,
          confirmed: 0,
          declined: 0,
        };
      }
      stats.demographic.schools[email].submitted += status.completedProfile
        ? 1
        : 0;
      stats.demographic.schools[email].admitted += status.admitted ? 1 : 0;
      stats.demographic.schools[email].confirmed += status.confirmed ? 1 : 0;
      stats.demographic.schools[email].declined += status.declined ? 1 : 0;

      // Count CMU college
      if (isCMU) {
        if (!stats.demographic.colleges[profile.college]) {
          stats.demographic.colleges[profile.college] = 0;
        }
        stats.demographic.colleges[profile.college] += 1;
      }

      // Count graduation years
      if (profile.graduationYear in stats.demographic.year) {
        stats.demographic.year[profile.graduationYear] += 1;
      } else {
        stats.demographic.year[profile.graduationYear] = 1;
      }

      // Count shirt sizes
      if (profile.shirtSize in stats.shirtSizes) {
        stats.shirtSizes[profile.shirtSize] += 1;
      } else {
        stats.shirtSizes[profile.shirtSize] = 1;
      }

      //count experience
      if (profile.hackathonExperience in stats.experiences) {
        stats.experiences[profile.hackathonExperience] += 1;
      } else {
        stats.experiences[profile.hackathonExperience] = 1;
      }

      //Dietary restrictions
      if (profile.dietaryRestrictions) {
        const restriction = profile.dietaryRestriction;
        if (!stats.dietaryRestrictions[restriction]) {
          stats.dietaryRestrictions[restriction] = 0;
        }
        stats.dietaryRestrictions[restriction] += 1;
      }
    }

    return stats;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
