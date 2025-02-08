import { ObjectId } from "mongodb";
import { Status } from "../_enums/Status";

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
      $project: {
        event: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        password: 0,
        verificationCode: 0,
        verificationExpiry: 0,
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
        event: eventID,
        status: Status.COMPLETED_PROFILE,
      },
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
