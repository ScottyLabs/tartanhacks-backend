import { ObjectId } from "bson";
import { Request, Response } from "express";
import Prize from "../models/Prize";
import Project from "../models/Project";
import Team from "../models/Team";
import { bad, error, notFound } from "../util/error";
import { getTartanHacks } from "./EventController";
import { findUserTeam } from "./TeamController";
import CheckinItem from "../models/CheckinItem";
import Checkin from "../models/Checkin";
import Settings from "../models/Settings";

const GRAND_PRIZE_NAME = "Scott Krulcik Grand Prize";

/**
 * Initialize the prizes collection and create the Grand Prize if it does not yet exist
 */
export async function createGrandPrizeIfAbsent(): Promise<void> {
  const tartanhacks = await getTartanHacks();
  const existingPrize = await Prize.findOne({ name: GRAND_PRIZE_NAME });
  if (existingPrize == null) {
    const prize = new Prize({
      event: tartanhacks._id,
      name: GRAND_PRIZE_NAME,
      description: "Grand prize",
    });
    await prize.save();
  }
}

export const createNewProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, url, slides, video, team, presentingVirtually } =
      req.body;

    const event = await getTartanHacks();

    const expoConfig = await getExpoConfig();
    if (!expoConfig) {
      return bad(res, "Expo configuration not found");
    }

    if (Date.now() > expoConfig.submissionDeadline) {
      return bad(
        res,
        "Project submission deadline has passed. Please contact the organizers if you need to save your project."
      );
    }

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

    if (!res.locals.user.admin) {
      const userTeam = await findUserTeam(res.locals.user._id);

      if (userTeam == null) {
        return bad(res, "You must be in a team to create a project.");
      }

      if (userTeam?._id.toString() !== team) {
        return bad(res, "You can only create projects for your team.");
      }
    }

    const grandPrize = await Prize.findOne({
      name: GRAND_PRIZE_NAME,
    });
    const prizes = [];
    if (grandPrize != null) {
      prizes.push(grandPrize._id);
    }

    const project = new Project({
      name: name,
      description: description,
      event: event._id,
      url: url,
      slides: slides,
      video: video,
      team: team,
      prizes,
      presentingVirtually: presentingVirtually,
    });

    await project.save();

    const json = project.toJSON();
    res.json({
      ...json,
    });
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res, err.message);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const saveProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Project ID.");
  }

  try {
    const project = await Project.findById(id);

    if (!project) {
      return notFound(res, "Project not found");
    }

    if (project.submitted) {
      return bad(res, "Project already submitted");
    }

    const expoConfig = await getExpoConfig();
    if (!expoConfig) {
      return bad(res, "Expo configuration not found");
    }

    if (Date.now() > expoConfig.submissionDeadline) {
      return bad(
        res,
        "Project submission deadline has passed. Please contact the organizers if you need to save your project."
      );
    }

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
      return bad(res, err.message);
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
    const result = await Project.find({})
      .populate({
        path: "team",
        populate: {
          path: "members",
          model: "User",
        },
      })
      .populate({
        path: "prizes",
      });

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

export const getProjectByTeamID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await Project.findOne({ team: id });
    if (result) {
      res.json(result);
    } else {
      return notFound(res);
    }
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const getProjectByUserID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const populatedTeam = await findUserTeam(new ObjectId(id));
    if (populatedTeam == null) {
      return bad(res, "User does not have a team!");
    } else {
      req.params.id = populatedTeam._id.toString();
      return getProjectByTeamID(req, res);
    }
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

export const enterProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { prizeID } = req.query;
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Project ID");
  }

  if (prizeID === null) {
    return bad(res, "Missing Prize ID");
  }

  try {
    const project = await Project.findById(id);

    if (!project) {
      return bad(res, "Invalid Project ID");
    }

    const prize = await Prize.findById(prizeID);
    if (!prize) {
      return bad(res, "Invalid Prize ID");
    }

    const teamID = project.team;

    const team = await Team.findById(teamID);

    if (!team) {
      return bad(res, "Team not found");
    }

    const members = team.members;
    let eligible = false;

    const requiredTalks = await CheckinItem.find({
      _id: { $in: prize.requiredTalk },
    });

    if (requiredTalks.length === 0) {
      eligible = true;
    } else {
      await Promise.all(
        members.map(async (member) => {
          const checkInItems = await CheckinItem.find({
            event: project.event,
          }).sort("startTime");
          for (let i = 0; i < checkInItems.length; i++) {
            const histories = await Checkin.find({
              user: member,
              item: checkInItems[i]._id,
            });
            const hasCheckedIn = histories.length !== 0;
            const requiredTalksString = prize.requiredTalk?.map((t) =>
              t.toString()
            );
            if (
              hasCheckedIn &&
              requiredTalksString?.includes(checkInItems[i]._id.toString())
            ) {
              eligible = true;
            }
          }
        })
      );
    }

    if (!eligible) {
      return bad(
        res,
        "You must have attended the sponsor talk to be eligible for this prize"
      );
    }

    await project.updateOne({
      $addToSet: {
        prizes: [prize._id],
      },
    });

    const updatedProject = await Project.findById(id);
    const json = updatedProject.toJSON();
    res.json({
      ...json,
    });
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res, err.message);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const getPresentingTeams = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tartanhacks = await getTartanHacks();
    const presentingProjects = await Project.find({
      event: tartanhacks._id,
      presentingVirtually: true,
    });
    const teams: string[] = [];
    for (let i = 0; i < presentingProjects.length; i++) {
      const presentingProject = presentingProjects[i];
      const team = await Team.findById(presentingProject.team);
      teams.push(team.name);
    }
    res.status(200).json(teams);
  } catch (err) {
    console.error(err);
    return error(res);
  }
};

/**
 * Submit a project
 */
export const submitProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    return bad(res, "Missing Project ID");
  }

  try {
    const project = await Project.findById(id);

    if (!project) {
      return notFound(res, "Project not found");
    }

    const expoConfig = await getExpoConfig();

    if (!expoConfig) {
      return bad(res, "Expo configuration not found");
    }

    if (Date.now() > expoConfig.submissionDeadline) {
      return bad(
        res,
        "Project submission deadline has passed. Please contact the organizers if you need to submit your project."
      );
    }

    await project.updateOne({
      $set: { submitted: true },
    });

    const updatedProject = await Project.findById(id);
    const json = updatedProject.toJSON();
    res.json({
      ...json,
    });
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res, err.message);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

/**
 * Assign projects to table numbers
 */
export async function assignProjectLocations(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const projects = await Project.find({}).sort({ name: "asc" });
    for (let i = 0; i < projects.length; i++) {
      await projects[i].updateOne({
        location: `Table ${i + 1}`,
      });
    }
  } catch (err) {
    console.error(err);
    return error(res);
  }
}

export const updateProjectTableNumber = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { tableNumber } = req.body;

  if (!id) {
    return bad(res, "Missing Project ID");
  }

  if (!tableNumber) {
    return bad(res, "Missing table number in request body");
  }

  try {
    const project = await Project.findById(id);

    if (!project) {
      return notFound(res, "Project not found");
    }

    if (project.tableNumber) {
      return bad(res, "Project already has a table number");
    }

    const expoConfig = await getExpoConfig();
    if (!expoConfig) {
      return bad(res, "Expo configuration not found");
    }

    if (Date.now() > expoConfig.expoStartTime) {
      return bad(
        res,
        "Cannot assign table numbers after expo start time. Please contact the organizers if you need to change your table number."
      );
    }

    await project.updateOne({
      $set: { tableNumber },
    });

    const updatedProject = await Project.findById(id);
    const json = updatedProject.toJSON();
    res.json({
      ...json,
    });
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res, err.message);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

async function getExpoConfig(): Promise<{
  expoStartTime: number;
  submissionDeadline: number;
} | null> {
  const settings = await Settings.findOne({});
  if (!settings || !settings.expoStartTime || !settings.submissionDeadline) {
    return null;
  }
  return {
    expoStartTime: settings.expoStartTime,
    submissionDeadline: settings.submissionDeadline,
  };
}
