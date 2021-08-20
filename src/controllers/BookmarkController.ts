import { Request, Response } from "express";
import Bookmark from "../models/Bookmark";
import { BookmarkType } from "../_enums/BookmarkType";
import { bad, notFound } from "../util/error";
import { getTartanHacks } from "./EventController";
import { IUser } from "../_types/User";
import { ObjectId } from "bson";
import User from "../models/User";
import Project from "../models/Project";

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
      event: event._id,
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
