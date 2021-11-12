import { ObjectId } from "bson";

/**
 * Generate the aggregation pipeline for getting a team with members and admin populated with name and email
 * @param eventId the ID of the event whose leaderboard to lookup
 */
export const getTeamPipeline = (eventId: ObjectId, teamId: ObjectId): any[] => {
  return [
    {
      $match: {
        event: eventId,
        _id: new ObjectId(teamId),
      },
    },
    {
      $limit: 1,
    },
    {
      $lookup: {
        from: "users",
        let: { members: "$members" },
        as: "emails",
        pipeline: [
          {
            $match: { $expr: { $in: ["$_id", "$$members"] } },
          },
          {
            $project: { _id: 1, email: 1 },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "profiles",
        let: { members: "$members" },
        as: "profiles",
        pipeline: [
          {
            $match: { $expr: { $in: ["$user", "$$members"] } },
          },
          {
            $project: { _id: "$user", firstName: 1, lastName: 1 },
          },
        ],
      },
    },
    {
      $addFields: { info: { $concatArrays: ["$emails", "$profiles"] } },
    },
    {
      $project: { profiles: 0, emails: 0 },
    },
  ];
};
