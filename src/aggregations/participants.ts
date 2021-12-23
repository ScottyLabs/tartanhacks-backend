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
      $unwind: {
        path: "$status",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        event: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        "status._id": 0,
        "status.event": 0,
        "status.user": 0,
        "status.__v": 0,
        "status.createdAt": 0,
        "status.updatedAt": 0,
      },
    },
  ];
};
