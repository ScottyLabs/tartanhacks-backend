import { ObjectId } from "bson";
import { Request, Response } from "express";
import {
  getCMUApplicantsPipeline,
  getParticipantsPipeline,
} from "../aggregations/participants";
import Profile from "../models/Profile";
import User from "../models/User";
import { bad } from "../util/error";
import { Status } from "../_enums/Status";
import { sendStatusUpdateEmail } from "./EmailController";
import { getTartanHacks } from "./EventController";
import * as TeamController from "./TeamController";

const statusLevels = {
  COMPLETED_PROFILE: 0,
  ADMITTED: 1,
  CONFIRMED: 2,
  DECLINED: 3,
  REJECTED: 4,
  VERIFIED: 5,
  UNVERIFIED: 6,
} as Record<Status, number>;

export const getParticipants = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.query;
  const event = await getTartanHacks();
  const pipeline = getParticipantsPipeline(event._id, name as string);
  const participants = await User.aggregate(pipeline);
  participants.sort(
    (a, b) =>
      statusLevels[(a.status as Status) ?? Status.UNVERIFIED] -
      statusLevels[(b.status as Status) ?? Status.UNVERIFIED]
  );
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
    if (!user.hasStatus(Status.COMPLETED_PROFILE)) {
      return bad(res, "User has not completed their profile yet!");
    }

    const profile = await Profile.findOne({
      event: tartanhacks._id,
      user: user._id,
    });

    await user.setStatus(Status.ADMITTED);
    await sendStatusUpdateEmail(user.email, profile?.firstName ?? "hacker");
    res.status(200).send();
  } catch (err) {
    res.status(500).json(err);
  }
};

export const admitAllCMU = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tartanhacks = await getTartanHacks();

    const pipeline = getCMUApplicantsPipeline(tartanhacks._id);
    const users = await User.aggregate(pipeline);

    const promises = [];
    for (const user of users) {
      const promise = async () => {
        await user.setStatus(Status.ADMITTED);
        const profile = await Profile.findOne({
          user: user._id,
          event: tartanhacks._id,
        });
        await sendStatusUpdateEmail(user.email, profile?.firstName ?? "hacker");
      };
      promises.push(promise());
    }
    await Promise.all(promises);

    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
};

export const admitAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tartanhacks = await getTartanHacks();

    const users = await User.find({
      status: Status.COMPLETED_PROFILE,
    });

    const promises = [];
    for (const user of users) {
      const promise = async () => {
        await user.setStatus(Status.ADMITTED);
        const profile = await Profile.findOne({
          user: user._id,
          event: tartanhacks._id,
        });
        await sendStatusUpdateEmail(user.email, profile?.firstName ?? "hacker");
      };
      promises.push(promise());
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

    const users = await User.find({
      status: Status.COMPLETED_PROFILE,
    });

    const promises = [];
    for (const user of users) {
      const promise = async () => {
        await user.setStatus(Status.REJECTED);
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
    if (!user.hasStatus(Status.COMPLETED_PROFILE)) {
      return bad(res, "User has not completed their profile yet!");
    }
    const profile = await Profile.findOne({
      event: tartanhacks._id,
      user: user._id,
    });
    await user.setStatus(Status.REJECTED);
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

export const getConfirmedUserEmails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({
      status: Status.CONFIRMED,
    });
    const emails = users.map((user) => user.email);
    res.status(200).json(emails);
  } catch (err) {
    res.status(500).json(err);
  }
};
