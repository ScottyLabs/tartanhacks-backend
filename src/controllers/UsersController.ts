import User from "../models/User";
import { Request, Response } from "express";
import { bad, notFound } from "../util/error";
import * as StatusController from "./StatusController";
import * as TeamController from "./TeamController";
import { ObjectId } from "bson";
import { getParticipantsPipeline } from "../aggregations/participants";
import { getTartanHacks } from "./EventController";
import Status from "../models/Status";

export const getParticipants = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const pipeline = getParticipantsPipeline(event._id);
  const participants = await User.aggregate(pipeline);
  res.json(participants);
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find(
      {},
      {
        _id: 1,
        email: 1,
        admin: 1,
        name: 1,
        company: 1,
      }
    );
    res.status(200).json(users);
    return;
  } catch (error) {
    res.status(500).json(error);
    return;
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const user = await User.findById(id, {
      _id: 1,
      email: 1,
      admin: 1,
      name: 1,
      company: 1,
    });
    res.status(200).json(user);
  } catch (err) {
    err.reason = err.reason.message;
    res.status(500).json(err);
  }
};

export const admitUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const user = await User.findById(new ObjectId(id));
    if (user == null) {
      return bad(res, "User not found");
    }
    const currentUser = res.locals.user;
    const status = await StatusController.getStatus(user._id);
    if (!status.completedProfile) {
      return bad(res, "User has not completed their profile yet!");
    }
    await StatusController.setAdmitted(user._id, currentUser._id);
    res.json(200);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const admitAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tartanhacks = await getTartanHacks();
  const currentUser = res.locals.user;
  Status.updateMany(
    {
      completedProfile: true,
      event: tartanhacks._id,
      admitted: null,
    },
    {
      admitted: true,
      admittedBy: currentUser._id,
    }
  )
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
};

export const rejectAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tartanhacks = await getTartanHacks();
  const currentUser = res.locals.user;
  Status.updateMany(
    {
      completedProfile: true,
      event: tartanhacks._id,
      admitted: null,
    },
    {
      admitted: false,
      admittedBy: currentUser._id,
    }
  )
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
};

export const rejectUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const user = await User.findById(new ObjectId(id));
    if (user == null) {
      return notFound(res, "User not found");
    }
    const currentUser = res.locals.user;
    const status = await StatusController.getStatus(user._id);
    if (!status.completedProfile) {
      return bad(res, "User has not completed their profile yet!");
    }
    await StatusController.setAdmitted(user._id, currentUser._id, false);
    res.json(200);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getUserTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const populatedTeam = await TeamController.findUserTeamPopulated(
      new ObjectId(id)
    );
    if (populatedTeam == null) {
      return bad(res, "User does not have a team!");
    }
    res.json(populatedTeam);
  } catch (err) {
    res.status(500).json(err);
  }
};
