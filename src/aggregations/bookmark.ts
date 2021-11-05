import { ObjectId } from "mongodb";
import { BookmarkType } from "../_enums/BookmarkType";

/**
 * Generate the aggregation pipeline for retrieving participant bookmarks of a specific user
 * @param eventId the ID of the event associated with this query
 * @param userId the ID of the user whose bookmarks to lookup
 */
export const getParticipantBookmarksPipeline = (
  eventId: ObjectId,
  userId: ObjectId
): any[] => {
  return [
    {
      $match: {
        event: eventId,
        user: userId,
        bookmarkType: BookmarkType.PARTICIPANT,
      },
    },
    {
      $lookup: {
        from: "users",
        let: { participantId: "$participant" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$participantId"],
              },
            },
          },
          {
            $project: {
              email: 1,
            },
          },
        ],
        as: "participant",
      },
    },
    {
      $unwind: "$participant",
    },
    {
      $lookup: {
        from: "profiles",
        let: { participantId: "$participant._id" },
        as: "profile",
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$user", "$$participantId"],
              },
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              resume: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    {
      $unwind: "$profile",
    },
    {
      $project: {
        bookmarkType: 1,
        description: 1,
        createdAt: 1,
        participant: 1,
        profile: 1,
      },
    },
  ];
};

/**
 * Generate the aggregation pipeline for retrieving project bookmarks of a specific user
 * @param eventId the ID of the event associated with this query
 * @param userId the ID of the user whose bookmarks to lookup
 */
export const getProjectBookmarksPipeline = (
  eventId: ObjectId,
  userId: ObjectId
): any[] => {
  return [
    {
      $match: {
        event: eventId,
        user: userId,
        bookmarkType: BookmarkType.PROJECT,
      },
    },
    {
      $lookup: {
        from: "projects",
        let: { projectId: "$project" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$projectId"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              prizes: 1,
              name: 1,
              description: 1,
              url: 1,
              slides: 1,
              video: 1,
              team: 1,
            },
          },
        ],
        as: "project",
      },
    },
    {
      $unwind: "$project",
    },
    {
      $lookup: {
        from: "teams",
        let: { teamId: "$project.team" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$teamId"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              description: 1,
            },
          },
        ],
        as: "project.team",
      },
    },
    {
      $unwind: "$project.team",
    },
    {
      $lookup: {
        from: "prizes",
        let: { prizeIds: "$project.prizes" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", "$$prizeIds"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
        ],
        as: "project.prizes",
      },
    },
    {
      $project: {
        bookmarkType: 1,
        project: 1,
        description: 1,
        createdAt: 1,
      },
    },
  ];
};
