/**
 * Service for computing user analytics
 */

import { getTartanHacks } from "../controllers/EventController";
import User from "../models/User";

export const computeAnalytics = async () => {
  const tartanhacks = await getTartanHacks();

  const stats = {
    lastUpdated: 0,

    total: 0,
    demo: {
      gender: {
        M: 0,
        F: 0,
        O: 0,
        N: 0,
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

    reimbursementTotal: 0,
    reimbursementMissing: 0,

    wantsHardware: 0,

    checkedIn: 0,
  };

  User.find({
    event: tartanhacks._id,
  }).then((users) => {
    stats.total = users.length;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
    }
  });
};
