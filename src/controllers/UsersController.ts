import { ObjectId } from "bson";
import { Request, Response } from "express";
import { IStatus } from "src/_types/Status";
import { getParticipantsPipeline } from "../aggregations/participants";
import Profile from "../models/Profile";
import Status from "../models/Status";
import User from "../models/User";
import { bad } from "../util/error";
import { sendStatusUpdateEmail } from "./EmailController";
import { getTartanHacks } from "./EventController";
import * as StatusController from "./StatusController";
import * as TeamController from "./TeamController";

export const getParticipants = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.query;
  const event = await getTartanHacks();
  const pipeline = getParticipantsPipeline(event._id, name as string);
  const participants = await User.aggregate(pipeline);
  res.status(200).json(participants);
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
  const tartanhacks = await getTartanHacks();
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
    const profile = await Profile.findOne({
      event: tartanhacks._id,
      user: user._id,
    });
    await StatusController.setAdmitted(user._id, currentUser._id);
    await sendStatusUpdateEmail(user.email, profile?.firstName ?? "hacker");
    res.status(200).send();
  } catch (err) {
    res.status(500).json(err);
  }
};

export const admitAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tartanhacks = await getTartanHacks();
    const currentUser = res.locals.user;

    const toUpdate = await Status.find({
      completedProfile: true,
      event: tartanhacks._id,
      admitted: null,
    });

    const promises = [];
    for (const status of toUpdate) {
      const promise = async () => {
        await Status.updateOne(
          { _id: status._id },
          { admitted: true, admittedBy: currentUser._id }
        );
        const user = await User.findById(status.user);
        const profile = await Profile.findOne({
          user: user._id,
          event: tartanhacks._id,
        });
        await sendStatusUpdateEmail(user.email, profile?.firstName ?? "hacker");
      };
      promises.push(promise);
    }
    Promise.all(promises);

    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
};

export const rejectAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tartanhacks = await getTartanHacks();
    const currentUser = res.locals.user;

    const toUpdate = await Status.find({
      completedProfile: true,
      event: tartanhacks._id,
      admitted: null,
    });

    const promises = [];
    for (const status of toUpdate) {
      const promise = async () => {
        await Status.updateOne(
          { _id: status._id },
          { admitted: false, admittedBy: currentUser._id }
        );
        const user = await User.findById(status.user);
        const profile = await Profile.findOne({
          user: user._id,
          event: tartanhacks._id,
        });
        await sendStatusUpdateEmail(user.email, profile?.firstName ?? "hacker");
      };
      promises.push(promise);
    }
    Promise.all(promises);

    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
};

export const rejectUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tartanhacks = await getTartanHacks();
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
    const profile = await Profile.findOne({
      event: tartanhacks._id,
      user: user._id,
    });
    await StatusController.setAdmitted(user._id, currentUser._id, false);
    await sendStatusUpdateEmail(user.email, profile?.firstName ?? "hacker");
    res.status(200).send();
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

export const getAdmittedUserEmails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tartanhacks = await getTartanHacks();
  try {
    const admittedStatuses = await Status.find(
      { admitted: true, event: tartanhacks._id },
      { user: 1 }
    );

    const emails: string[] = [];

    for (let i = 0; i < admittedStatuses.length; i++) {
      const admittedStatus = admittedStatuses[i];
      const user = await User.findById(admittedStatus.user);
      emails.push(user.email);
    }

    res.status(200).json(emails);
  } catch (err) {
    res.status(500).json(err);
  }
};
