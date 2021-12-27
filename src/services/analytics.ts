/**
 * Service for computing user analytics
 */

import Status from "../models/Status";
import { getTartanHacks } from "../controllers/EventController";
import Profile from "../models/Profile";
import User from "../models/User";
import { findUserTeam } from "../controllers/TeamController";

type Stats = {
  total: number;
  totalTeams: number;
  demo: {
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
    year: Record<string, number>;
  };

  teams: Record<string, number>;
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
  wantsHardware: 0;
};

export const computeAnalytics = async (): Promise<Stats> => {
  const tartanhacks = await getTartanHacks();

  const stats: Stats = {
    total: 0,
    totalTeams: 0,
    demo: {
      gender: {},
      schools: {},
      year: {},
    },

    teams: {},
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
    const profiles = await Profile.find({ event: tartanhacks._id });
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const user = await User.findById(profile.user);
      const status = await Status.findOne({ user: profile.user });
      const team = await findUserTeam(profile.user);

      if (user == null) {
        continue;
      }

      stats.total += 1;

      // Grab the email extension
      const email = user.email.split("@")[1];

      // Count verified
      stats.verified += status.verified ? 1 : 0;

      // Count submitted
      stats.submitted += status.completedProfile ? 1 : 0;

      // Count accepted
      stats.admitted += status.admitted ? 1 : 0;

      // Count confirmed
      stats.confirmed += status.confirmed ? 1 : 0;

      // Count confirmed that are CMU
      stats.confirmedCmu +=
        status.confirmed && (email === "andrew.cmu.edu" || email === "cmu.edu")
          ? 1
          : 0;

      // Count declined
      stats.declined += status.declined ? 1 : 0;

      /// Add to the gender
      if (profile.gender in stats.demo.gender) {
        stats.demo.gender[profile.gender] += 1;
      } else {
        stats.demo.gender[profile.gender] = 1;
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
      if (!stats.demo.schools[email]) {
        stats.demo.schools[email] = {
          submitted: 0,
          admitted: 0,
          confirmed: 0,
          declined: 0,
        };
      }
      stats.demo.schools[email].submitted += status.completedProfile ? 1 : 0;
      stats.demo.schools[email].admitted += status.admitted ? 1 : 0;
      stats.demo.schools[email].confirmed += status.confirmed ? 1 : 0;
      stats.demo.schools[email].declined += status.declined ? 1 : 0;

      //Count teams
      if (team) {
        if (team.name in stats.teams) {
          stats.teams[team.name] += 1;
        } else {
          stats.teams[team.name] = 1;
          stats.totalTeams += 1;
        }
      }

      // Count graduation years
      if (profile.graduationYear in stats.demo.year) {
        stats.demo.year[profile.graduationYear] += 1;
      } else {
        stats.demo.year[profile.graduationYear] = 1;
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
        for (let j = 0; j < profile.dietaryRestrictions.length; j++) {
          const restriction = profile.dietaryRestrictions[j];
          if (!stats.dietaryRestrictions[restriction]) {
            stats.dietaryRestrictions[restriction] = 0;
          }
          stats.dietaryRestrictions[restriction] += 1;
        }
      }
    }

    return stats;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
