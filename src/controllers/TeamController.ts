import { getTartanHacks } from "./EventController";
import { Request, Response } from "express";
import Team from "../models/Team";
import { ObjectId } from "mongoose";
import { ITeam } from "../_types/Team";
import { bad } from "../util/error";

/**
 * Find the team of a user
 * @param userId ID of the user to search
 * @return the Team of the user or null if there is none
 */
const findUserTeam = async (userId: ObjectId): Promise<ITeam> => {
  const event = await getTartanHacks();
  const team = await Team.findOne({
    event: event._id,
    $elemMatch: {
      $eq: userId,
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
