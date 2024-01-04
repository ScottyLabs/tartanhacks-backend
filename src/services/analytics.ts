/**
 * Service for computing user analytics
 */

import { doesStatusImply, Status } from "../_enums/Status";
import { getParticipantAnalyticsPipeline } from "../aggregations/analytics";
import { getTartanHacks } from "../controllers/EventController";
import User from "../models/User";

type Stats = {
  total: number;
  demographic: {
    gender: Record<string, number>;
    domains: Record<
      string,
      {
        submitted: number;
        admitted: number;
        confirmed: number;
        declined: number;
      }
    >;
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
  attendance: {
    physical: number;
    virtual: number;
  };
};

export const computeAnalytics = async (): Promise<Stats> => {
  const tartanhacks = await getTartanHacks();
  const pipeline = getParticipantAnalyticsPipeline(tartanhacks._id);
  const stats: Stats = {
    total: 0,
    demographic: {
      gender: {},
      domains: {},
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
    attendance: {
      physical: 0,
      virtual: 0,
    },
  };

  try {
    const participants = await User.aggregate(pipeline);
    for (const user of participants) {
      const { status, profile } = user;

      stats.total += 1;

      // Grab the email extension
      const email = user.email.split("@")[1];
      let isCMU = email === "andrew.cmu.edu" || email === "cmu.edu";

      if (!status) {
        continue;
      }

      // Count verified
      const isVerified =
        status == Status.WAITLISTED || doesStatusImply(status, Status.VERIFIED);
      stats.verified += isVerified ? 1 : 0;

      // Count submitted
      const isProfileComplete =
        status == Status.WAITLISTED ||
        doesStatusImply(status, Status.COMPLETED_PROFILE);
      stats.submitted += isProfileComplete ? 1 : 0;

      if (isProfileComplete && !isCMU) {
        isCMU = profile.school.includes("Carnegie Mellon");
      }

      // Count accepted
      const isAdmitted =
        status == Status.WAITLISTED || doesStatusImply(status, Status.ADMITTED);
      stats.admitted += isAdmitted ? 1 : 0;

      // Count confirmed
      const isConfirmed =
        status == Status.WAITLISTED ||
        doesStatusImply(status, Status.CONFIRMED);
      stats.confirmed += isConfirmed ? 1 : 0;

      // Count declined
      const isDeclined = doesStatusImply(status, Status.DECLINED);
      stats.declined += isDeclined ? 1 : 0;

      // Count confirmed that are CMU
      stats.confirmedCmu += isConfirmed && isCMU ? 1 : 0;

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
        isConfirmed && profile.gender == "Female" ? 1 : 0;
      stats.confirmedMale += isConfirmed && profile.gender == "Male" ? 1 : 0;
      stats.confirmedOther += isConfirmed && profile.gender == "Other" ? 1 : 0;
      stats.confirmedNone +=
        isConfirmed && profile.gender == "Prefer not to say" ? 1 : 0;

      // Count the number of people who want hardware
      stats.wantsHardware += profile.wantsHardware ? 1 : 0;

      // Count domains
      if (!stats.demographic.domains[email]) {
        stats.demographic.domains[email] = {
          submitted: 0,
          admitted: 0,
          confirmed: 0,
          declined: 0,
        };
      }
      stats.demographic.domains[email].submitted += isProfileComplete ? 1 : 0;
      stats.demographic.domains[email].admitted += isAdmitted ? 1 : 0;
      stats.demographic.domains[email].confirmed += isConfirmed ? 1 : 0;
      stats.demographic.domains[email].declined += isDeclined ? 1 : 0;

      // Count schools
      if (isProfileComplete) {
        if (!stats.demographic.schools[profile.school]) {
          stats.demographic.schools[profile.school] = {
            submitted: 0,
            admitted: 0,
            confirmed: 0,
            declined: 0,
          };
        }
        stats.demographic.schools[profile.school].submitted += isProfileComplete
          ? 1
          : 0;
        stats.demographic.schools[profile.school].admitted += isAdmitted
          ? 1
          : 0;
        stats.demographic.schools[profile.school].confirmed += isConfirmed
          ? 1
          : 0;
        stats.demographic.schools[profile.school].declined += isDeclined
          ? 1
          : 0;
      }

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
      if (profile.dietaryRestrictions && isConfirmed) {
        profile.dietaryRestrictions.forEach((restriction: string) => {
          if (!stats.dietaryRestrictions[restriction]) {
            stats.dietaryRestrictions[restriction] = 0;
          }
          stats.dietaryRestrictions[restriction] += 1;
        });
      }

      //Count attendance modes
      if (profile.attendingPhysically) {
        stats.attendance.physical += 1;
      } else {
        stats.attendance.virtual += 1;
      }
    }

    return stats;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
