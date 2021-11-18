import { ObjectId } from "bson";
import { Request, Response } from "express";
import { getTeamPipeline } from "../aggregations/team";
import Team from "../models/Team";
import TeamRequest from "../models/TeamRequest";
import User from "../models/User";
import { bad, notFound, unauthorized } from "../util/error";
import { TeamRequestStatus, TeamRequestType } from "../_enums/TeamRequest";
import { ITeam } from "../_types/Team";
import { getTartanHacks } from "./EventController";
import * as SettingsController from "./SettingsController";

/**
 * Get a team by ID
 */
export const getTeamById = async (teamId: ObjectId): Promise<ITeam> => {
  interface MemberEmail {
    _id: string;
    email: string;
  }
  interface MemberName {
    _id: string;
    firstName: string;
    lastName: string;
  }
  type MemberType = MemberEmail & MemberName;

  const event = await getTartanHacks();
  const pipeline = getTeamPipeline(event._id, teamId);
  const matchingTeams: any[] = await Team.aggregate(pipeline);
  // Email and name are in separate objects of type `MemberName` and `MemberEmail`
  // in an array in `team.info`

  if (matchingTeams.length == 0) {
    return null;
  }

  const team = matchingTeams[0];

  // Merge `MemberName` and `MemberEmail` objects corresponding to the same id
  const memberMap: { [key: string]: Partial<MemberType> } = {};
  const memberInfo = team.info as (MemberEmail | MemberName)[];
  for (const member of memberInfo) {
    const { _id }: { _id: string } = member;
    if (memberMap[_id] != null) {
      memberMap[_id] = { ...memberMap[_id], ...member };
    } else {
      memberMap[_id] = {
        ...member,
        firstName: null,
        lastName: null,
      };
    }
  }

  // Map original members field to corresponding objects with name and email information
  const members = team.members.map((memberId: string) => memberMap[memberId]);
  team.members = members;
  team.admin = memberMap[team.admin];

  // Delete intermediate aggregation array
  delete team.info;

  return team;
};

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
  if (team) {
    const populatedTeam = await getTeamById(team._id);
    return populatedTeam;
  }
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
 * Get information about a specific team
 */
export const getTeam = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const team = await getTeamById(new ObjectId(id));
  if (!team) {
    return notFound(res, "Team not found");
  }

  res.json(team);
};

/**
 * List all teams
 */
export const getTeams = async (req: Request, res: Response): Promise<void> => {
  const event = await getTartanHacks();
  const teams = await Team.find({ event: event._id });
  res.json(teams);
};

/**
 * Get the current user's team
 */
export const getOwnTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = res.locals.user;
  const team = await findUserTeam(user._id);
  if (!team) {
    return notFound(res, "You are not in a team!");
  }
  res.json(team);
};

/**
 * Get the team of the currently logged in user
 */
export const getCurrentUserTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = res.locals.user;

  const team = await findUserTeam(user._id);
  if (!team) {
    return bad(res, "You are not in a team!");
  }

  res.json(team.toJSON());
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

  const { name, description, visible } = req.body;
  const existingTeam = await findTeamByName(name);
  if (existingTeam) {
    return bad(res, "That team name is already taken!");
  }

  const team = new Team({
    event: event._id,
    name,
    description,
    admin: user._id,
    members: [user._id],
    visible,
  });

  await team.save();

  res.json(team.toJSON());
};

/**
 * Update a team, i.e. change visibility, name, or description
 */
export const updateTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = res.locals.user;

  const userTeam = await findUserTeam(user._id);
  if (!userTeam) {
    return bad(res, "You do not belong to a team");
  }

  if (userTeam.admin._id.toString() != user._id.toString()) {
    return unauthorized(res, "You are not the team admin!");
  }

  const { name, description, visible } = req.body;
  if (name) {
    const existingTeam = await findTeamByName(name);
    if (existingTeam) {
      return bad(res, "That team name is already taken!");
    }
  }

  const update: { name?: string; description?: string; visible?: boolean } = {};
  if (name) {
    update.name = name;
  }
  if (description) {
    update.description = description;
  }
  if (visible) {
    update.visible = visible;
  }

  await Team.updateOne({ _id: userTeam._id }, { $set: update });
  const updatedTeam = await findUserTeam(user._id);

  res.json(updatedTeam.toJSON());
};

/**
 * Join a team
 */
export const joinTeam = async (req: Request, res: Response): Promise<void> => {
  const event = await getTartanHacks();
  const { id } = req.params;
  const user = res.locals.user;
  const { message } = req.body || {};

  if (!id) {
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
    _id: new ObjectId(id),
    event: event._id,
  });

  if (!team) {
    return notFound(res, "Team does not exist!");
  }

  const existingRequest = await TeamRequest.findOne({
    event: event._id,
    user: user._id,
    team: new ObjectId(id),
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
    team: new ObjectId(id),
    type: TeamRequestType.JOIN,
    status: TeamRequestStatus.PENDING,
    message,
  });
  await teamRequest.save();
  res.json(teamRequest.toJSON());
};

/**
 * Kick a member from a team
 */
export const kickUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const currentUser = res.locals.user;

  if (!id) {
    return bad(res, "Missing user ID");
  }

  const team = await findUserTeam(currentUser._id);
  if (!team) {
    return bad(res, "You're not in a team!");
  }

  if (!team.admin.equals(currentUser._id)) {
    return unauthorized(res, "You're not the team admin!");
  }

  if (id === currentUser._id.toString()) {
    return bad(res, "You can't kick yourself! Leave the team instead.");
  }

  if (!team.members.includes(new ObjectId(id))) {
    return bad(res, "That user is not in your team!");
  }

  await team.updateOne({
    $pull: {
      members: id,
    },
  });

  res.status(200).send();
};

/**
 * Invite a user to a team
 */
export const inviteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { id } = req.params;
  const currentUser = res.locals.user;

  if (!id) {
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

  if (team.members.includes(new ObjectId(id))) {
    return bad(res, "User is already in the team!");
  }

  const user = await User.findOne({
    _id: new ObjectId(id),
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
 * Invite a user to a team
 */
export const inviteUserByEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { email } = req.body;
  const currentUser = res.locals.user;

  if (!email) {
    return bad(res, "Missing email in request body");
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

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return notFound(res, "User does not exist!");
  }

  if (team.members.includes(user._id)) {
    return bad(res, "User is already in the team!");
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
 * Promote another team member into an admin
 * This can only be done by a team admin and simultaneously demotes the admin
 * that performed this action.
 */
export const promoteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const currentUser = res.locals.user;

  if (!id) {
    return bad(res, "Missing user ID");
  }

  const team = await findUserTeam(currentUser._id);
  if (!team) {
    return bad(res, "You're not in a team!");
  }

  if (!team.admin.equals(currentUser._id)) {
    return unauthorized(res, "You're not the team admin!");
  }

  if (id === currentUser._id.toString()) {
    return bad(
      res,
      "You can't promote yourself! You are already the team admin."
    );
  }

  if (!team.members.includes(new ObjectId(id))) {
    return bad(res, "That user is not in your team!");
  }

  await team.updateOne({
    $set: {
      admin: new ObjectId(id),
    },
  });

  res.status(200).send();
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
