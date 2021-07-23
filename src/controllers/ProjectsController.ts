import Project from "src/models/Project";
import { bad, error } from "../util/error";
import { Request, Response } from "express";
import { getTartanHacks } from "./EventController";

export const createNewProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, url, slides, video, team } = req.body;

    const event = await getTartanHacks();

    const existingProjects = await Project.findOne({
      team: team,
      event: event._id,
    });

    if (existingProjects) {
      return bad(
        res,
        "You already have a project. Please edit or delete your existing project."
      );
    }

    const project = new Project({
      name: name,
      description: description,
      event: event._id,
      url: url,
      slides: slides,
      video: video,
      team: team,
      prizes: [],
    });

    await project.save();

    const json = project.toJSON();
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
