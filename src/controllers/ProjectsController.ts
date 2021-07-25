import Project from "src/models/Project";
import Prize from "src/models/Prize";
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

export const editProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Project ID.");
  }

  try {
    await Project.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true },
      function (err, result) {
        if (err) {
          console.error(err);
          return error(res);
        }

        const json = result.toJSON();
        res.json({
          ...json,
        });
      }
    );
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const getProjectByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await Project.findById(id);

    res.json(result);
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const getAllProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await Project.find();

    res.status(200).json(result);
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Project ID.");
  }

  try {
    await Project.findByIdAndDelete(id);

    res.status(200).json({
      message: "Successfully deleted project.",
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

export const getAllPrizes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await Prize.find();

    res.status(200).json(result);
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};
