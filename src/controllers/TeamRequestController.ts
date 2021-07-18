import { ObjectId } from "bson";
import { Request, Response } from "express";
import Team from "../models/Team";
import TeamRequest from "../models/TeamRequest";
import { bad, notFound, unauthorized } from "../util/error";
import { TeamRequestStatus, TeamRequestType } from "../_enums/TeamRequest";
import { ITeam } from "../_types/Team";
import { IUser } from "../_types/User";
import { getTartanHacks } from "./EventController";
import * as SettingsController from "./SettingsController";
import { findUserTeam } from "./TeamController";

/**
 * Get a list of team requests inward and outbound from a team
 */
export const getTeamRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { teamId } = req.params;
  const user = res.locals.user;

  if (!teamId) {
    return bad(res, "Missing team ID");
  }

  const userTeam = await findUserTeam(user._id);
  if (!userTeam) {
    return bad(res, "You're not in a team");
  }

  if (!userTeam.admin.equals(user._id)) {
    return unauthorized(res, "You're not the admin of this team!");
  }

  const requests = await TeamRequest.find({
    event: event._id,
    team: new ObjectId(teamId),
    status: TeamRequestStatus.PENDING,
  }).populate("user");

  res.json(requests);
};

/**
 * Get a list of team requests inward and outbound from a user
 */
export const getUserRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { userId: userIdStr } = req.params;
  const userId = new ObjectId(userIdStr);
  const user = res.locals.user;

  if (!userId) {
    return bad(res, "Missing user ID");
  }

  if (!user._id.equals(userId) && !user.admin) {
    return unauthorized(res, "User is not the owner or admin!");
  }

  const userTeam = await findUserTeam(user._id);
  if (userTeam) {
    return bad(res, "You're already in a team!");
  }

  const requests = await TeamRequest.find({
    event: event._id,
    user: new ObjectId(userId),
    status: TeamRequestStatus.PENDING,
  }).populate("team");

  res.json(requests);
};

/**
 * Accept a team request
 */
export const acceptTeamRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { requestId } = req.params;
  const user: IUser = res.locals.user;

  if (!requestId) {
    return bad(res, "Missing request ID");
  }

  const userTeam = await findUserTeam(user._id);
  if (userTeam) {
    return bad(res, "You're already in a team!");
  }

  const request = await TeamRequest.findOne({
    event: event._id,
    _id: new ObjectId(requestId),
    status: TeamRequestStatus.PENDING,
  }).populate("team");

  if (!request) {
    return notFound(res, "No such request found");
  }

  const { maxTeamSize } = await SettingsController.getSettings();

  const team = (request.team as unknown) as ITeam;
  if (!team) {
    return bad(res, "That team no longer exists!");
  }
  if (team.members.length == maxTeamSize) {
    return bad(res, "That team is already full!");
  }

  if (request.type === TeamRequestType.INVITE) {
    if (!request.user.equals(user._id)) {
      return unauthorized(res, "You do not own that team request");
    }
    await Team.findOneAndUpdate(
      {
        event: event._id,
        _id: new ObjectId(team._id),
        // Find the same team that is not full, to ensure atomic update
        $expr: {
          $lt: [{ $size: "members" }, maxTeamSize],
        },
      },
      {
        $addToSet: { members: user._id },
      }
    );
    const updatedRequest = await request.updateOne(
      {
        $set: { status: TeamRequestStatus.ACCEPTED },
      },
      {
        new: true,
      }
    );
    res.json(updatedRequest.toJSON());
  } else if (request.type === TeamRequestType.JOIN) {
    if (!team.admin.equals(user._id)) {
      return unauthorized(res, "You are not a team admin");
    }
    await Team.findOneAndUpdate(
      {
        event: event._id,
        _id: new ObjectId(team._id),
        // Find the same team that is not full, to ensure atomic update
        $expr: {
          $lt: [{ $size: "members" }, maxTeamSize],
        },
      },
      {
        $addToSet: { members: user._id },
      }
    );
    const updatedRequest = await request.updateOne(
      {
        $set: { status: TeamRequestStatus.ACCEPTED },
      },
      {
        new: true,
      }
    );
    res.json(updatedRequest.toJSON());
  }

  return bad(res, "Invalid team request type");
};

/**
 * Decline a team request
 */
export const declineTeamRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { requestId } = req.params;
  const user: IUser = res.locals.user;

  if (!requestId) {
    return bad(res, "Missing request ID");
  }

  const request = await TeamRequest.findOneAndUpdate({
    event: event._id,
    _id: new ObjectId(requestId),
    status: TeamRequestStatus.PENDING,
  }).populate("team");

  if (!request) {
    return notFound(res, "No such request found");
  }

  if (request.type === TeamRequestType.INVITE) {
    if (!request.user.equals(user._id)) {
      return unauthorized(res, "You do not own that team request");
    }
    const updatedRequest = await request.updateOne(
      {
        $set: { status: TeamRequestStatus.DECLINED },
      },
      {
        new: true,
      }
    );
    res.json(updatedRequest.toJSON());
  } else if (request.type === TeamRequestType.JOIN) {
    const team = (request.team as unknown) as ITeam;
    if (!team.admin.equals(user._id)) {
      return unauthorized(res, "You are not a team admin");
    }
    const updatedRequest = await request.updateOne(
      {
        $set: { status: TeamRequestStatus.DECLINED },
      },
      {
        new: true,
      }
    );
    res.json(updatedRequest.toJSON());
  }

  return bad(res, "Invalid team request type");
};

/**
 * Cancel a team request
 */
export const cancelTeamRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { requestId } = req.params;
  const user: IUser = res.locals.user;

  if (!requestId) {
    return bad(res, "Missing request ID");
  }

  const request = await TeamRequest.findOneAndUpdate({
    event: event._id,
    _id: new ObjectId(requestId),
    status: TeamRequestStatus.PENDING,
  }).populate("team");

  if (!request) {
    return notFound(res, "No such request found");
  }

  if (request.type === TeamRequestType.JOIN) {
    if (!request.user.equals(user._id)) {
      return unauthorized(res, "You do not own that team request");
    }
    const updatedRequest = await request.updateOne(
      {
        $set: { status: TeamRequestStatus.CANCELLED },
      },
      {
        new: true,
      }
    );
    res.json(updatedRequest.toJSON());
  } else if (request.type === TeamRequestType.INVITE) {
    const team = (request.team as unknown) as ITeam;
    if (!team.admin.equals(user._id)) {
      return unauthorized(res, "You are not a team admin");
    }
    const updatedRequest = await request.updateOne(
      {
        $set: { status: TeamRequestStatus.CANCELLED },
      },
      {
        new: true,
      }
    );
    res.json(updatedRequest.toJSON());
  }

  return bad(res, "Invalid team request type");
};
