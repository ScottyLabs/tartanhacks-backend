import { ObjectId } from "mongodb";

/**
 * Generate the aggregation pipeline for getting data of participants
 * @param eventId the ID of the event to get analytics
 */
export const getParticipantDataPipeline = (eventId: ObjectId): any[] => {
  return [
    {
      $match: {
        company: null,
      },
    },
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
  ];
};
