/**
 * Controller for admin routes
 */
import { Request, Response } from "express";
import multer from "multer";
import { IConfirmation } from "../_types/Confirmation";
import { StatusField } from "../_enums/Status";
import Profile from "../models/Profile";
import { bad, error, notFound, unauthorized } from "../util/error";
import { IProfile } from "../_types/Profile";
import * as EventController from "./EventController";
import { getStatus, updateStatus } from "./StatusController";
import { ObjectId } from "bson";
import { hasResume, uploadResume } from "../services/storage";
import User from "../models/User";

const upload = multer({ storage: multer.memoryStorage() });

/**
 * File parsing middleware
 */
export const fileMiddleware = upload.single("file");

/**
 * Submit a user's profile or update it if it already exists
 */
export const getProfile = async (
  userId: ObjectId
): Promise<Partial<IProfile>> => {
  const tartanhacks = await EventController.getTartanHacks();
  const profile = await Profile.findOne({
    user: userId,
    event: tartanhacks._id,
  });
  if (profile) {
    const resume = await profile.getResumeUrl();
    const newProfile = profile.toObject() as IProfile;
    newProfile.resume = resume;
    return newProfile;
  }
  return profile;
};

/**
 * Get current user's profile if it exists
 */
export const getOwnProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = res.locals.user;

  const profile = await getProfile(user._id);
  if (!profile) {
    return notFound(res);
  }
  res.json(profile);
};

/**
 * Get a user's profile if it exists
 */
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const profile = await getProfile(new ObjectId(id));
  if (!profile) {
    return notFound(res);
  }
  res.json(profile);
};

/**
 * Submit a user's profile or update it if it already exists
 */
export const submitProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tartanhacks = await EventController.getTartanHacks();
  try {
    const user = res.locals.user;
    const profileArgs = req.body as IProfile;
    // Prevent user from inserting confirmation here
    delete profileArgs.confirmation;
    delete profileArgs.resume;

    // Filter out invalid object IDs in sponsor ranking
    if (profileArgs.sponsorRanking) {
      profileArgs.sponsorRanking = profileArgs.sponsorRanking.filter((id) =>
        ObjectId.isValid(id)
      );
    }

    // Check if user has uploaded a resume yet
    const resumeExists = await hasResume(user._id);
    if (!resumeExists) {
      return bad(res, "You have not yet uploaded a resume!");
    }

    // Check if display name is taken
    const { displayName } = profileArgs;
    const existingProfile = await Profile.findOne({
      event: tartanhacks._id,
      displayName,
    });
    if (
      existingProfile &&
      existingProfile.user.toString() !== user._id.toString()
    ) {
      return bad(res, `Display name ${displayName} is taken!`);
    }

    await Profile.findOneAndUpdate(
      { user: user._id, event: tartanhacks._id },
      {
        ...profileArgs,
      },
      {
        upsert: true,
      }
    );
    await updateStatus(user._id, StatusField.COMPLETED_PROFILE, true);
    const updatedProfile = await getProfile(user._id);
    res.json(updatedProfile);
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      console.error(err);
      return bad(res, err.message);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

/**
 * Upload a resume into the GCP storage bucket
 */
export const submitResume = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      return bad(res, "Missing resume attachment");
    }
    const user = res.locals.user;
    const { buffer } = req.file;
    const fileId = await uploadResume(buffer, user._id);
    res.json(fileId);
  } catch (err) {
    console.error(err);
    error(res);
  }
};

/**
 * Get a resume from the GCP storage bucket
 */
export const getResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const profile = await Profile.findOne({
      user: new ObjectId(id),
    });
    if (!profile) {
      return notFound(res, "User has not yet created a profile");
    }

    const resume = await profile.getResumeUrl();
    if (!resume) {
      return notFound(res, "User has not yet submitted a resume");
    }
    res.redirect(resume);
  } catch (err) {
    console.error(err);
    error(res);
  }
};

/**
 * Submit a profile confirmation after acceptance
 */
export const submitConfirmation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const confirmation = req.body as IConfirmation;

    const user = res.locals.user;
    const profile = await getProfile(user._id);
    if (profile == null) {
      return bad(res, "User does not have a profile yet. Create one first");
    }

    const status = await getStatus(user._id);
    if (!status.admitted) {
      return unauthorized(res, "You have not been admitted to the event!");
    }
    if (status.declined) {
      return bad(res, "You already declined your attendance for the event");
    }

    await Profile.findOneAndUpdate(
      { _id: profile._id },
      {
        $set: {
          confirmation,
          updatedAt: new Date(),
        },
      },
      {
        runValidators: true,
      }
    );

    await updateStatus(user._id, StatusField.CONFIRMED, true);

    res.status(200).send();
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      bad(res);
    } else {
      console.error(err);
      error(res);
    }
  }
};

/**
 * Decline acceptance
 */
export const declineAcceptance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = res.locals.user;
    const profile = await getProfile(user._id);
    if (profile == null) {
      return bad(res, "User does not have a profile yet. Create one first");
    }

    const status = await getStatus(user._id);
    if (!status.admitted) {
      return unauthorized(res, "You have not been admitted to the event!");
    }
    if (status.confirmed) {
      return bad(res, "You already confirmed your attendance for the event!");
    }

    await updateStatus(user._id, StatusField.DECLINED, true);
    res.json(profile);
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      bad(res);
    } else {
      console.error(err);
      error(res);
    }
  }
};

/**
 * Check if display name is availavle
 */
export const displayNameAvailable = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.body;
  const user = res.locals.user;
  if (!name) {
    return bad(res, "Display name must be specified!");
  }

  const event = await EventController.getTartanHacks();
  const existingProfile = await Profile.findOne({
    event: event._id,
    displayName: name,
  });

  res
    .status(200)
    .send(
      existingProfile == null ||
        existingProfile.user.toString() === user._id.toString()
    );
};
