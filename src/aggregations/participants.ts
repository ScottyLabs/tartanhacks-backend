import { ObjectId } from "mongodb";

/**
 * Generate the aggregation pipeline for getting participants of a particular event
 * @param eventId the ID of the event whose participants to lookup
 */
export const getParticipantsPipeline = (
  eventId: ObjectId,
  name?: string
): any[] => {
  const fuzzyFilter: any = {};
  if (name) {
    fuzzyFilter["$text"] = { $search: name };
  }
  return [
    {
      $lookup: {
        from: "profiles",
        let: { userId: "$_id", eventId },
        as: "profile",
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$event", "$$eventId"],
              },
              ...fuzzyFilter,
            },
          },
          {
            $match: {
              $expr: {
                $eq: ["$user", "$$userId"],
              },
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$profile",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $expr: { company: null },
      },
    },
    {
      $match: {
        profile: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "teams",
        let: { userId: "$_id", eventId },
        as: "team",
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$event", "$$eventId"],
              },
            },
          },
          {
            $match: {
              $expr: {
                $in: ["$$userId", "$members"],
              },
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$team",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "statuses",
        let: { userId: "$_id", eventId },
        as: "status",
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$event", "$$eventId"],
              },
            },
          },
          {
            $match: {
              $expr: {
                $eq: ["$user", "$$userId"],
              },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "teams",
        let: { userId: "$_id", eventId },
        as: "team",
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$event", "$$eventId"],
              },
            },
          },

          {
            $match: {
              $expr: {
                $in: ["$$userId", "$members"],
              },
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$status",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$team",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "status.completedProfile": -1,
        "status.admittedBy": 1,
      },
    },
    {
      $project: {
        event: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        password: 0,
        verificationCode: 0,
        verificationExpiry: 0,
        company: 0,
        "status._id": 0,
        "status.event": 0,
        "status.user": 0,
        "status.__v": 0,
        "status.createdAt": 0,
        "status.updatedAt": 0,
        "team.event": 0,
        "team.__v": 0,
        "team.createdAt": 0,
        "team.updatedAt": 0,
      },
    },
  ];
};

/**
 * Generate the aggregation pipeline for getting CMU applicants
 * @param eventId the ID of the event whose participants to lookup
 */
export const getCMUApplicantsPipeline = (eventID: ObjectId): any[] => {
  return [
    {
      $match: {
        completedProfile: true,
        event: eventID,
        admitted: null as string,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $addFields: {
        isCMU: {
          $regexMatch: {
            input: "$user.email",
            regex: /.+@(andrew\.)?cmu\.edu/,
          },
        },
      },
    },
    {
      $match: {
        isCMU: true,
      },
    },
  ];
};
