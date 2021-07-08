import Team from "src/models/Team";
import { bad, error } from "../util/error";
import { Request, Response } from "express";
import { getTartanHacks } from "./EventController";

export const addNewTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, open } = req.body;

    const event = await getTartanHacks();

    const existingTeams = await Team.find({
      event: event._id,
      members: res.locals.user._id,
    });
    if (existingTeams.length !== 0) {
      return bad(res, "You cannot create a new team while being in a team!");
    }

    const team = new Team({
      name: name,
      open: open,
      event: event,
      members: [res.locals.user._id],
      admin: res.locals.user._id,
    });

    await team.save();

    const json = team.toJSON();
    res.json({
      ...json,
    });
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};
