import { ObjectId } from "bson";
import { FilterQuery } from "mongoose";

const populateOnUserField = (userField: string): any[] => {
  const pipeline: any[] = [
    {
      $lookup: {
        from: "users",
        let: { field: `$${userField}` },
        as: userField,
        pipeline: [
          {
            $match: { $expr: { $eq: ["$_id", `$$field`] } },
          },
          {
            $project: { _id: 1, email: 1 },
          },
        ],
      },
    },
    {
      $unwind: `$${userField}`,
    },
    {
      $lookup: {
        from: "profiles",
        let: { field: `$${userField}` },
        as: "profile",
        pipeline: [
          {
            $match: { $expr: { $eq: ["$user", "$$field._id"] } },
          },
          {
            $project: { _id: "$user", firstName: 1, lastName: 1 },
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
  // Need to construct addFields stage separately to dynamically assign userField
  const addFieldsParams: any = {};
  addFieldsParams[userField] = {
    firstName: "$profile.firstName",
    lastName: "$profile.lastName",
  };
  const addFieldsStage = {
    $addFields: addFieldsParams,
  };
  pipeline.push(addFieldsStage);
  return pipeline;
};

const populateTeamPipeline: any[] = [
  ...populateOnUserField("admin"),
  {
    $unwind: "$members",
  },
  ...populateOnUserField("members"),
  {
    $group: {
      _id: "$_id",
      members: { $push: "$members" },
      visible: { $first: "$visible" },
      name: { $first: "$name" },
      description: { $first: "$description" },
      createdAt: { $first: "$createdAt" },
      updatedAt: { $first: "$updatedAt" },
      admin: { $first: "$admin" },
    },
  },
];

/**
 * Generate the aggregation pipeline for getting a team with members and admin populated with name and email
 * @param eventId the ID of the event whose leaderboard to lookup
 */
export const getTeamPipeline = (eventId: ObjectId, teamId: ObjectId): any[] => {
  return [
    {
      $match: {
        event: eventId,
        _id: teamId,
      },
    },
    {
      $limit: 1,
    },
    ...populateTeamPipeline,
  ];
};

export const getTeamsPipeline = (eventId: ObjectId): any[] => {
  return [
    {
      $match: {
        event: eventId,
      },
    },
    ...populateTeamPipeline,
  ];
};
