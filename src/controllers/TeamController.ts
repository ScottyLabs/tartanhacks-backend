import { ObjectId } from "bson";
import { Request, Response } from "express";
import Team from "../models/Team";
import TeamRequest from "../models/TeamRequest";
import User from "../models/User";
import { bad, notFound, unauthorized } from "../util/error";
import { TeamRequestStatus, TeamRequestType } from "../_enums/TeamRequest";
import { ITeam } from "../_types/Team";
import { getTartanHacks } from "./EventController";
import * as SettingsController from "./SettingsController";

/**
 * Find the team of a user
 * @param userId ID of the user to search
 * @return the Team of the user or null if there is none
 */
export const findUserTeam = async (userId: ObjectId): Promise<ITeam> => {
  const event = await getTartanHacks();
  const team = await Team.findOne({
    event: event._id,
    members: {
      $elemMatch: {
        $eq: userId,
      },
    },
  });
  return team;
};

/**
 * Find a team by its name
 * @param name Name to look up
 * @return the Team with the provided name or none
 */
const findTeamByName = async (name: string): Promise<ITeam> => {
  const event = await getTartanHacks();
  const team = await Team.findOne({
    event: event._id,
    name,
  });
  return team;
};

/**
 * Create a new team
 */
export const createTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const user = res.locals.user;

  const userTeam = await findUserTeam(user._id);
  if (userTeam) {
    return bad(
      res,
      "You are already in a team! Leave it first before creating a new one"
    );
  }

  const { name, open } = req.body;
  const existingTeam = await findTeamByName(name);
  if (existingTeam) {
    return bad(res, "That team name is already taken!");
  }

  const team = new Team({
    event: event._id,
    name,
    admin: user._id,
    members: [user._id],
    open,
  });

  await team.save();

  res.json(team.toJSON());
};

/**
 * List all teams
 */
export const getTeams = async (req: Request, res: Response): Promise<void> => {
  const event = await getTartanHacks();
  const teams = await Team.find({ eventId: event._id });
  res.json(teams);
};

export const getTeam = async (req: Request, res: Response): Promise<void> => {
  const event = await getTartanHacks();
  const { teamId } = req.params;
  const team = await Team.find({
    eventId: event._id,
    _id: new ObjectId(teamId),
  });
  if (team == null) {
    return notFound(res, "Team not found!");
  } else {
    res.json(team);
  }
};

/**
 * Join a team
 */
export const joinTeam = async (req: Request, res: Response): Promise<void> => {
  const event = await getTartanHacks();
  const { teamId } = req.params;
  const user = res.locals.user;
  const { message } = req.body || {};

  if (!teamId) {
    return bad(res, "Missing team ID");
  }

  const userTeam = await findUserTeam(user._id);
  if (userTeam) {
    return bad(
      res,
      "You're already in a team. Leave it before joining another."
    );
  }

  const team = await Team.findOne({
    _id: new ObjectId(teamId),
    event: event._id,
  });

  if (!team) {
    return notFound(res, "Team does not exist!");
  }

  const existingRequest = await TeamRequest.findOne({
    event: event._id,
    user: user._id,
    team: new ObjectId(teamId),
  });

  if (existingRequest) {
    return bad(
      res,
      "You already have an existing team request/invite for that team!"
    );
  }

  const teamRequest = new TeamRequest({
    event: event._id,
    user: user._id,
    team: new ObjectId(teamId),
    type: TeamRequestType.JOIN,
    status: TeamRequestStatus.PENDING,
    message,
  });
  await teamRequest.save();
  res.json(teamRequest.toJSON());
};

/**
 * Invite a user to a team
 */
export const inviteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { userId } = req.params;
  const currentUser = res.locals.user;

  if (!userId) {
    return bad(res, "Missing user ID");
  }

  const team = await findUserTeam(currentUser._id);
  if (!team) {
    return bad(res, "You're not in a team!");
  }

  if (!team.admin.equals(currentUser._id)) {
    return unauthorized(res, "You're not the team admin!");
  }

  const { maxTeamSize } = await SettingsController.getSettings();

  if (team.members.length >= maxTeamSize) {
    return bad(res, "The team is full!");
  }

  if (team.members.includes(new ObjectId(userId))) {
    return bad(res, "User is already in the team!");
  }

  const user = await User.findOne({
    event: event._id,
    _id: new ObjectId(userId),
  });
  if (!user) {
    return notFound(res, "User does not exist!");
  }

  const request = new TeamRequest({
    event: event._id,
    user: user._id,
    team: team._id,
    type: TeamRequestType.INVITE,
    status: TeamRequestStatus.PENDING,
  });

  await request.save();

  res.json(request.toJSON());
};

/**
 * Leave a team
 */
export const leaveTeam = async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;
  const team = await findUserTeam(user._id);

  if (!team) {
    return bad(res, "You're not in a team!");
  }

  if (!team.members.includes(user._id)) {
    return bad(res, "You're not in the team!");
  }

  if (team.admin.equals(user._id) && team.members.length > 1) {
    return bad(
      res,
      "You can't leave the team if you're the team admin Make another member admin first!"
    );
  }

  if (team.members.length === 1) {
    await team.remove();
    res.status(200).send();
  } else {
    const updatedTeam = await team.updateOne({
      $pull: {
        members: user._id,
      },
    });
    res.json(updatedTeam.toJson());
  }
};
