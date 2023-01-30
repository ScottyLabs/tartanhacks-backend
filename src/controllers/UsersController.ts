import { ObjectId } from "bson";
import { Request, Response } from "express";
import { IUser } from "src/_types/User";
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
  participants.sort((a: IUser, b: IUser) => {
    // Status level
    const levelA = statusLevels[(a.status as Status) ?? Status.UNVERIFIED];
    const levelB = statusLevels[(b.status as Status) ?? Status.UNVERIFIED];

    // Add additional sort order based on email domain for equal statuses
    const emailA = a.email;
    const emailB = b.email;

    const domainA = emailA.slice(emailA.indexOf("@") + 1);
    const domainB = emailB.slice(emailB.indexOf("@") + 1);

    const tokensA = domainA.split(".");
    const tokensB = domainB.split(".");

    // Top level domains (e.g. cmu.edu from andrew.cmu.edu)
    const topDomainA = tokensA.slice(tokensA.length - 2).join(".");
    const topDomainB = tokensB.slice(tokensB.length - 2).join(".");

    let domainComparison = topDomainA.localeCompare(topDomainB);
    if (domainComparison !== 0) {
      // If domains are not equal, prioritize CMU emails
      if (topDomainA === "cmu.edu") {
        domainComparison = -1;
      } else if (topDomainB === "cmu.edu") {
        domainComparison = 1;
      }
    }

    return levelA - levelB + (levelA === levelB ? domainComparison : 0);
  });
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

// Make judges from a list of emails
export async function makeJudges(req: Request, res: Response): Promise<void> {
  const emails = req.body as string[];
  if (!Array.isArray(emails)) {
    return bad(res, "Request body should be an array of emails!");
  }

  await User.updateMany(
    {
      email: {
        $in: emails,
      },
    },
    {
      judge: true,
    }
  );

  res.status(200).send();
}

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

export async function getVerifiedUserEmails(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const users = await User.find({
      status: Status.VERIFIED,
    });
    const emails = users.map((user) => user.email);
    const emailString = emails.join(", ");
    res.status(200).send(emailString);
  } catch (err) {
    res.status(500).json(err);
  }
}

export async function getAdmittedUserEmails(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const users = await User.find({
      status: Status.ADMITTED,
    });
    const emails = users.map((user) => user.email);
    const emailString = emails.join(", ");
    res.status(200).send(emailString);
  } catch (err) {
    res.status(500).json(err);
  }
}

export const getConfirmedUserEmails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({
      status: Status.CONFIRMED,
    });
    const emails = users.map((user) => user.email);
    const emailString = emails.join(", ");
    res.status(200).send(emailString);
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 * TODO: remove
 * Reverts the statuses of ADMITTED users to APPLICATION_COMPLETE
 */
export async function waitlistPendingUsers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await User.updateMany(
      {
        status: Status.ADMITTED,
      },
      {
        status: Status.COMPLETED_PROFILE,
      }
    );
    res.status(200).send();
  } catch (err) {
    res.status(500).json(err);
  }
}
