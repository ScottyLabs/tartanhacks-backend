import { Request, Response } from "express";
import Bookmark from "../models/Bookmark";
import { BookmarkType } from "../_enums/BookmarkType";
import { bad, notFound } from "../util/error";
import { getTartanHacks } from "./EventController";
import { IUser } from "../_types/User";
import { ObjectId } from "bson";
import User from "../models/User";
import Project from "../models/Project";
import { driveIdToUrl } from "../util/driveIdToUrl";

/**
 * Create a new bookmark
 */
export const createBookmark = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { type, participant, project, description } = req.body;
  if (!type) {
    return bad(res, "Missing bookmark type");
  }

  const user: IUser = res.locals.user;
  if (type == BookmarkType.PARTICIPANT) {
    if (!participant) {
      return bad(res, "Missing participant");
    }
    const existing = await Bookmark.findOne({
      user: user._id,
      event: event._id,
      type,
      participant: new ObjectId(participant),
    });
    if (existing) {
      return bad(res, "Bookmark already exists");
    }
    const participantUser = await User.findOne({
      _id: new ObjectId(participant),
    });
    if (!participantUser) {
      return notFound(res, "Participant does not exist");
    }
    const bookmark = new Bookmark({
      user: user._id,
      event: event._id,
      type,
      participant: new ObjectId(participant),
      description,
    });
    await bookmark.save();
    res.json(bookmark);
  } else if (type == BookmarkType.PROJECT) {
    if (!project) {
      return bad(res, "Missing project");
    }
    const existing = await Bookmark.findOne({
      user: user._id,
      event: event._id,
      type,
      project: new ObjectId(project),
    });
    if (existing) {
      return bad(res, "Bookmark already exists");
    }
    const projectDoc = await Project.findOne({
      _id: new ObjectId(project),
      event: event._id,
    });
    if (!projectDoc) {
      return notFound(res, "Project does not exist");
    }
    const bookmark = new Bookmark({
      user: user._id,
      event: event._id,
      type,
      project: new ObjectId(project),
      description,
    });
    await bookmark.save();
    res.json(bookmark);
  }
};

export const getParticipantBookmarks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const user: IUser = res.locals.user;
  const bookmarks = await Bookmark.aggregate([
    {
      $match: {
        event: event._id,
        user: user._id,
        type: BookmarkType.PARTICIPANT,
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
        as: "profile",
      },
    },
    {
      $unwind: "$profile",
    },
    {
      $project: {
        type: 1,
        description: 1,
        createdAt: 1,
        participant: 1,
        profile: 1,
      },
    },
  ]);

  bookmarks.forEach((bookmark) => {
    bookmark.participant = { ...bookmark.participant, ...bookmark.profile };
    if (bookmark.participant.resume) {
      bookmark.participant.resume = driveIdToUrl(bookmark.participant.resume);
    }
    delete bookmark.profile;
  });
  res.json(bookmarks);
};

export const getProjectBookmarks = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.json([]);
};
