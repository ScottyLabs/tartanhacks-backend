import { ObjectId } from "mongodb";

/**
 * Generate the aggregation pipeline for getting projects
 * @param eventId the ID of the event to get analytics
 */
export const getProjectsPipeline = (eventId: ObjectId): any[] => {
  return [
    {
      $lookup: {
        from: "teams",
        localField: "team",
        foreignField: "_id",
        as: "team",
      },
    },
    {
      $unwind: {
        path: "$team",
      },
    },
    {
      $lookup: {
        from: "prizes",
        localField: "prizes",
        foreignField: "_id",
        as: "prizes",
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
  ];
};
