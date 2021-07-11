import { ObjectId } from "bson";
import { Request, Response } from "express";
import Team from "../models/Team";
import TeamRequest from "../models/TeamRequest";
import { bad, notFound } from "../util/error";
import { TeamRequestStatus, TeamRequestType } from "../_enums/TeamRequest";
import { ITeam } from "../_types/Team";
import { getTartanHacks } from "./EventController";

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
    members: [],
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
