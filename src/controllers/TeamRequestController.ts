import { ObjectId } from "bson";
import { Request, Response } from "express";
import User from "../models/User";
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
 * Get a list of team requests inward and outbound from the current user's team
 */
export const getOwnTeamRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const user = res.locals.user;

  const userTeam = await findUserTeam(user._id);
  if (!userTeam) {
    return bad(res, "You're not in a team");
  }

  if (!userTeam.admin.equals(user._id)) {
    return unauthorized(res, "You're not the admin of this team!");
  }

  const requests = await TeamRequest.find({
    event: event._id,
    team: new ObjectId(userTeam._id),
    status: TeamRequestStatus.PENDING,
  }).populate("user");

  res.json(requests);
};

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
 * Get a list of team requests inward and outbound from the currently logged in user
 */
export const getOwnUserRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const user = res.locals.user;
  const userId = user._id;

  if (!userId) {
    return bad(res, "Missing user ID");
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

  const filtered = requests.filter((team) => team.team != null);

  res.json(filtered);
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

  const filtered = requests.filter((team) => team.team != null);

  res.json(filtered);
};

/**
 * Open a team request, marking it as seen
 */
export const openTeamRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { requestId } = req.params;
  const user: IUser = res.locals.user;

  if (!requestId) {
    return bad(res, "Missing request ID");
  }

  const request = await TeamRequest.findOne({
    _id: new ObjectId(requestId),
    event: event._id,
    status: TeamRequestStatus.PENDING,
  });

  if (!request) {
    return notFound(res, "Request not found");
  }

  if (request.type === TeamRequestType.JOIN) {
    const team = await Team.findById(request.team);
    if (team.admin.toString() != user._id.toString()) {
      return unauthorized(res, "You're not the admin of this team!");
    }

    await request.updateOne({
      $set: {
        seen: true,
      },
    });
    res.status(200).send();
  } else if (request.type === TeamRequestType.INVITE) {
    await request.updateOne({
      $set: {
        seen: true,
      },
    });
    res.status(200).send();
  }
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

  const request = await TeamRequest.findOne({
    event: event._id,
    _id: new ObjectId(requestId),
    status: TeamRequestStatus.PENDING,
  }).populate("team");

  if (!request) {
    return notFound(res, "No such pending request found");
  }

  const { maxTeamSize } = await SettingsController.getSettings();

  const team = request.team as unknown as ITeam;
  if (!team) {
    return bad(res, "That team no longer exists!");
  }
  if (team.members.length === maxTeamSize) {
    return bad(res, "That team is already full!");
  }

  if (request.type === TeamRequestType.INVITE) {
    const userTeam = await findUserTeam(user._id);
    if (userTeam) {
      return bad(res, "You're already in a team!");
    }

    if (!request.user.equals(user._id)) {
      return unauthorized(res, "You do not own that team request");
    }
    await Team.findOneAndUpdate(
      {
        event: event._id,
        _id: new ObjectId(team._id),
        // Find the same team that is not full, to ensure atomic update
        $expr: {
          $lt: [{ $size: "$members" }, maxTeamSize],
        },
      },
      {
        $addToSet: { members: user._id },
      }
    );
    await request.updateOne(
      {
        $set: { status: TeamRequestStatus.ACCEPTED },
      },
      {
        new: true,
      }
    );
    res.status(200).send();
    return;
  } else if (request.type === TeamRequestType.JOIN) {
    if (!team.admin.equals(user._id)) {
      return unauthorized(res, "You are not a team admin");
    }
    const joiningUser = await User.findById(request.user);
    const joiningUserTeam = await findUserTeam(joiningUser._id);
    if (joiningUserTeam) {
      return bad(res, "That user is already in a team!");
    }

    const senderId = request.user;
    await Team.findOneAndUpdate(
      {
        event: event._id,
        _id: new ObjectId(team._id),
        // Find the same team that is not full, to ensure atomic update
        $expr: {
          $lt: [{ $size: "$members" }, maxTeamSize],
        },
      },
      {
        $addToSet: { members: senderId },
      }
    );
    await request.updateOne(
      {
        $set: { status: TeamRequestStatus.ACCEPTED },
      },
      {
        new: true,
      }
    );
    res.status(200).send();
    return;
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

  const request = await TeamRequest.findOne({
    event: event._id,
    _id: new ObjectId(requestId),
    status: TeamRequestStatus.PENDING,
  }).populate("team");

  if (!request) {
    return notFound(res, "No such pending request found");
  }

  if (request.type === TeamRequestType.INVITE) {
    if (!request.user.equals(user._id)) {
      return unauthorized(res, "You do not own that team request");
    }
    await TeamRequest.updateOne(
      {
        event: event._id,
        _id: new ObjectId(requestId),
        status: TeamRequestStatus.PENDING,
      },
      {
        $set: { status: TeamRequestStatus.DECLINED },
      },
      {
        new: true,
      }
    );
    res.status(200).send();
    return;
  } else if (request.type === TeamRequestType.JOIN) {
    const team = request.team as unknown as ITeam;
    if (!team.admin.equals(user._id)) {
      return unauthorized(res, "You are not a team admin");
    }
    await TeamRequest.updateOne(
      {
        event: event._id,
        _id: new ObjectId(requestId),
        status: TeamRequestStatus.PENDING,
      },
      {
        $set: { status: TeamRequestStatus.DECLINED },
      }
    );
    res.status(200).send();
    return;
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

  const request = await TeamRequest.findOne({
    event: event._id,
    _id: new ObjectId(requestId),
    status: TeamRequestStatus.PENDING,
  }).populate("team");

  if (!request) {
    return notFound(res, "No such pending request found");
  }

  if (request.type === TeamRequestType.JOIN) {
    if (!request.user.equals(user._id)) {
      return unauthorized(res, "You do not own that team request");
    }
    await TeamRequest.updateOne(
      {
        event: event._id,
        _id: new ObjectId(requestId),
        status: TeamRequestStatus.PENDING,
      },
      {
        $set: { status: TeamRequestStatus.CANCELLED },
      }
    );
    res.status(200).send();
    return;
  } else if (request.type === TeamRequestType.INVITE) {
    const team = request.team as unknown as ITeam;
    if (!team.admin.equals(user._id)) {
      return unauthorized(res, "You are not a team admin");
    }
    await TeamRequest.updateOne(
      {
        event: event._id,
        _id: new ObjectId(requestId),
        status: TeamRequestStatus.PENDING,
      },
      {
        $set: { status: TeamRequestStatus.CANCELLED },
      }
    );
    res.status(200).send();
    return;
  }

  return bad(res, "Invalid team request type");
};
