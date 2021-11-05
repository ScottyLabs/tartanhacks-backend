import { ObjectId } from "mongodb";

/**
 * Generate the aggregation pipeline for getting the leaderboard of profiles with corresponding ranks
 * @param eventId the ID of the event whose leaderboard to lookup
 */
export const getLeaderboardPipeline = (eventId: ObjectId): any[] => {
  return [
    {
      $match: {
        event: eventId,
      },
    },
    {
      $sort: {
        totalPoints: -1,
      },
    },
    {
      $group: {
        _id: {},
        items: {
          $push: "$$ROOT",
        },
      },
    },
    {
      $unwind: {
        path: "$items",
        includeArrayIndex: "items.rank",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$items",
      },
    },
    {
      $group: {
        _id: "$totalPoints",
        ties: {
          $push: "$$ROOT",
        },
        rank: {
          $first: "$rank",
        },
      },
    },
    {
      $unwind: {
        path: "$ties",
      },
    },
    {
      $sort: {
        rank: 1,
        "ties.displayName": 1,
        "ties.user": 1,
      },
    },
    {
      $project: {
        _id: 0,
        user: "$ties.user",
        totalPoints: "$ties.totalPoints",
        displayName: "$ties.displayName",
        rank: {
          $add: ["$rank", 1],
        },
      },
    },
  ];
};

/**
 * Generate the aggregation pipeline for getting theleaderboard rank of the current user
 * @param eventId the ID of the event whose leaderboard to lookup
 * @param userId the ID of the user whose position to lookup
 */
export const getLeaderboardRankPipeline = (
  eventId: ObjectId,
  userId: ObjectId
): any[] => {
  const aggregation = getLeaderboardPipeline(eventId);
  aggregation.push({
    $match: {
      user: userId,
    },
  });
  return aggregation;
};
