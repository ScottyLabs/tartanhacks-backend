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
 * Generate the aggregation pipeline for getting the leaderboard rank of the current user
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

/**
 * Generate the aggregation pipeline for computing total points of all users from check-in history
 * @param eventId the ID of the event whose leaderboard to lookup
 */
export const getPointsPipeline = (eventId: ObjectId): any[] => {
  return [
    {
      $lookup: {
        from: "checkins",
        localField: "user",
        foreignField: "user",
        as: "checkins",
      },
    },
    {
      $unwind: {
        path: "$checkins",
      },
    },
    {
      $match: {
        "checkins.event": eventId,
      },
    },
    {
      $lookup: {
        from: "checkin-items",
        localField: "checkins.item",
        foreignField: "_id",
        as: "checkins.item",
      },
    },
    {
      $unwind: {
        path: "$checkins.item",
      },
    },
    {
      $group: {
        _id: "$_id",
        totalPointsNew: {
          $sum: "$checkins.item.points",
        },
        totalPoints: {
          $first: "$totalPoints",
        },
      },
    },
    {
      $match: {
        $expr: {
          $ne: ["$totalPoints", "$totalPointsNew"],
        },
      },
    },
  ];
};
