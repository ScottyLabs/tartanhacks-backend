import { ObjectId } from "mongodb";

/**
 * Generate the aggregation pipeline for getting participants of a particular event
 * @param eventId the ID of the event whose participants to lookup
 */
export const getParticipantsPipeline = (eventId: ObjectId): any[] => {
  return [
    {
      $match: {
        company: null,
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
