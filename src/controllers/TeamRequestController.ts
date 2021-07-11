import { ObjectId } from "bson";
import { Request, Response } from "express";
import Team from "../models/Team";
import TeamRequest from "../models/TeamRequest";
import { bad, notFound } from "../util/error";
import { TeamRequestStatus, TeamRequestType } from "../_enums/TeamRequest";
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

  if (userTeam.admin != user._id) {
    return bad(res, "You're not the admin of this team!");
  }

  const requests = await TeamRequest.find({
    event: event._id,
    team: new ObjectId(teamId),
    status: TeamRequestStatus.PENDING,
  });

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
  const { userId } = req.params;
  const user = res.locals.user;

  if (!userId) {
    return bad(res, "Missing user ID");
  }

  if (userId !== user._id && !user.admin) {
    return bad(res, "User is not the owner or admin!");
  }

  const userTeam = await findUserTeam(user._id);
  if (userTeam) {
    return bad(res, "You're already in a team!");
  }

  const requests = await TeamRequest.find({
    event: event._id,
    user: new ObjectId(userId),
    status: TeamRequestStatus.PENDING,
  });

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

  const request = await TeamRequest.findOneAndUpdate({
    event: event._id,
    _id: new ObjectId(requestId),
    status: TeamRequestStatus.PENDING,
  });

  if (!request) {
    return notFound(res, "No such request found");
  }

  const { maxTeamSize } = await SettingsController.getInstance();
  if (request.type == TeamRequestType.INVITE) {
    if (request.user == user._id) {
      const team = await Team.findOne({
        event: event._id,
        _id: new ObjectId(request.team),
      });
      if (!team) {
        return bad(res, "That team no longer exists!");
      }
      if (team.members.length == maxTeamSize) {
        return bad(res, "That team is already full!");
      }
      await Team.findOneAndUpdate(
        {
          event: event._id,
          _id: new ObjectId(request.team),
          // Find the same team that is not full, to ensure atomic update
          $expr: {
            $lt: [{ $size: "members" }, maxTeamSize],
          },
        },
        {
          $addToSet: { members: user._id },
        }
      );
    }
  }
};
