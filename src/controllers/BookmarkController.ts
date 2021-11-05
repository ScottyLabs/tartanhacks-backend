import { Request, Response } from "express";
import Bookmark from "../models/Bookmark";
import { BookmarkType } from "../_enums/BookmarkType";
import { bad, notFound, unauthorized } from "../util/error";
import { getTartanHacks } from "./EventController";
import { IUser } from "../_types/User";
import { ObjectId } from "bson";
import User from "../models/User";
import Project from "../models/Project";
import { driveIdToUrl } from "../util/driveIdToUrl";
import {
  getParticipantBookmarksPipeline,
  getProjectBookmarksPipeline,
} from "../aggregations/bookmark";

/**
 * Create a new bookmark
 */
export const createBookmark = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { bookmarkType, participant, project, description } = req.body;
  if (!bookmarkType) {
    return bad(res, "Missing bookmark type");
  }

  const user: IUser = res.locals.user;
  if (bookmarkType == BookmarkType.PARTICIPANT) {
    if (!participant) {
      return bad(res, "Missing participant");
    }
    const existing = await Bookmark.findOne({
      user: user._id,
      event: event._id,
      type: bookmarkType,
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
      bookmarkType,
      participant: new ObjectId(participant),
      description,
    });
    await bookmark.save();
    res.json(bookmark);
  } else if (bookmarkType == BookmarkType.PROJECT) {
    if (!project) {
      return bad(res, "Missing project");
    }
    const existing = await Bookmark.findOne({
      user: user._id,
      event: event._id,
      bookmarkType,
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
      bookmarkType,
      project: new ObjectId(project),
      description,
    });
    await bookmark.save();
    res.json(bookmark);
  }
};

/**
 * Get a specific bookmark
 */
export const getBookmark = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return bad(res, "Missing bookmark id");
  }

  const user: IUser = res.locals.user;
  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return notFound(res, "Bookmark does not exist!");
  }

  if (bookmark.user != user._id && !user.admin) {
    return unauthorized(res, "You do not have permission to view this!");
  }

  res.json(bookmark);
};

/**
 * Delete a bookmark
 */
export const deleteBookmark = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    return bad(res, "Missing bookmark id");
  }

  const user: IUser = res.locals.user;
  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return notFound(res, "Bookmark does not exist!");
  }

  if (bookmark.user != user._id && !user.admin) {
    return unauthorized(res, "You do not have permission to delete this!");
  }

  bookmark.delete();
  res.status(200).send();
};

export const getParticipantBookmarks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const user: IUser = res.locals.user;
  const aggregation = getParticipantBookmarksPipeline(event._id, user._id);
  const bookmarks = await Bookmark.aggregate(aggregation);

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
  const event = await getTartanHacks();
  const user: IUser = res.locals.user;
  const aggregation = getProjectBookmarksPipeline(event._id, user._id);
  const bookmarks = await Bookmark.aggregate(aggregation);

  res.json(bookmarks);
};
