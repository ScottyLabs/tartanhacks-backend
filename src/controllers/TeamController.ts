import { ObjectId } from "bson";
import { Request, Response } from "express";
import { IUser } from "../_types/User";
import { getTeamPipeline, getTeamsPipeline } from "../aggregations/team";
import Team from "../models/Team";
import TeamRequest from "../models/TeamRequest";
import User from "../models/User";
import { bad, notFound, unauthorized } from "../util/error";
import { TeamRequestStatus, TeamRequestType } from "../_enums/TeamRequest";
import { ITeam } from "../_types/Team";
import { getTartanHacks } from "./EventController";
import * as SettingsController from "./SettingsController";

export interface PopulatedTeam {
  _id: ObjectId;
  event: ObjectId;
  name: string;
  description: string;
  admin: IUser;
  members: IUser[];
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get a team by ID
 */
export const getTeamById = async (teamId: ObjectId): Promise<PopulatedTeam> => {
  const event = await getTartanHacks();
  const pipeline = getTeamPipeline(event._id, teamId);
  const matchingTeams = await Team.aggregate(pipeline);
  if (matchingTeams.length == 0) {
    return null;
  }

  const team = matchingTeams[0];
  return team;
};

/**
 * Find the team of a user with populated members
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
 * Find the team of a user with populated members
 * @param userId ID of the user to search
 * @return the Team of the user or null if there is none
 */
export const findUserTeamPopulated = async (
  userId: ObjectId
): Promise<PopulatedTeam> => {
  const team = await findUserTeam(userId);
  if (team) {
    const populatedTeam = await getTeamById(team._id);
    return populatedTeam;
  }
  return null;
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
  const pipeline = getTeamsPipeline(event._id);
  const teams = await Team.aggregate(pipeline);
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
  const team = await findUserTeamPopulated(user._id);
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

export const searchTeamByName = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.query;
  const teams = await Team.find({ $text: { $search: name as string } })
    .populate("admin")
    .populate("members");
  res.json(teams);
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

  const populatedTeam = await findUserTeamPopulated(user._id);
  res.json(populatedTeam);
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

  if (userTeam.admin.toString() != user._id.toString()) {
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
  const updatedTeam = await findUserTeamPopulated(user._id);

  res.json(updatedTeam);
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
    status: TeamRequestStatus.PENDING,
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

  // Block duplicate requests
  const existingRequest = await TeamRequest.findOne({
    user: new ObjectId(user._id),
    team: new ObjectId(team._id),
    type: TeamRequestType.INVITE,
    status: TeamRequestStatus.PENDING,
  });

  if (existingRequest != null) {
    return bad(res, "This user still has a pending invite from your team!");
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

  // Block duplicate requests
  const existingRequest = await TeamRequest.findOne({
    user: new ObjectId(user._id),
    team: new ObjectId(team._id),
    type: TeamRequestType.INVITE,
    status: TeamRequestStatus.PENDING,
  });

  if (existingRequest != null) {
    return bad(res, "This user still has a pending invite from your team!");
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
    await team.updateOne({
      $pull: {
        members: user._id,
      },
    });
    res.status(200).send();
  }
};
