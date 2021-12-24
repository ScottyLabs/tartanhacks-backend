/**
 * Service for computing user analytics
 */

import Status from "src/models/Status";
import { getTartanHacks } from "../controllers/EventController";
import Profile from "../models/Profile";
import User from "../models/User";

export const computeAnalytics = async () => {
  const tartanhacks = await getTartanHacks();

  const stats = {
    lastUpdated: 0,

    total: 0,
    demo: {
      gender: {
        Male: 0,
        Female: 0,
        "Prefer not to say": 0,
        Other: 0,
      },
      schools: {},
      year: {
        "2021": 0,
        "2022": 0,
        "2023": 0,
        "2024": 0,
        "2025": 0,
        "2026": 0,
      },
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

    shirtSizes: {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
      WXS: 0,
      WS: 0,
      WM: 0,
      WL: 0,
      WXL: 0,
      WXXL: 0,
      None: 0,
    },

    dietaryRestrictions: {},

    experiences: {
      "0": 0,
      "1~3": 0,
      "4+": 0,
    },

    hostNeededFri: 0,
    hostNeededSat: 0,
    hostNeededUnique: 0,

    hostNeededFemale: 0,
    hostNeededMale: 0,
    hostNeededOther: 0,
    hostNeededNone: 0,

    wantsHardware: 0,

    checkedIn: 0,
  };

  Profile.find({
    event: tartanhacks._id,
  }).then(async (profiles) => {
    stats.total = profiles.length;

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[0];
      const user = await User.findById(profile.user);
      const status = await Status.findOne({ user: profile.user });

      // Grab the email extension
      const email = user.email.split("@")[1];

      // Add to the gender
      stats.demo.gender[profile.gender] += 1;

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

      stats.confirmedFemale +=
        status.confirmed && profile.gender == "Female" ? 1 : 0;
      stats.confirmedMale +=
        status.confirmed && profile.gender == "Male" ? 1 : 0;
      stats.confirmedOther +=
        status.confirmed && profile.gender == "Other" ? 1 : 0;
      stats.confirmedNone +=
        status.confirmed && profile.gender == "Prefer not to say" ? 1 : 0;

      // Count declined
      stats.declined += status.declined ? 1 : 0;

      // Count the number of people who want hardware
      stats.wantsHardware += profile.wantsHardware ? 1 : 0;

      // Count schools
      // if (!stats.demo.schools[email]) {
      //   stats.demo.schools[email] = {
      //     submitted: 0,
      //     admitted: 0,
      //     confirmed: 0,
      //     declined: 0,
      //   };
      // }
    }
  });
};
