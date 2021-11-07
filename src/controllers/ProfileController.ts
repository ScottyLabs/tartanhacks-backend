/**
 * Controller for admin routes
 */
import { Request, Response } from "express";
import multer from "multer";
import { uploadResume } from "../services/drive";
import { IConfirmation } from "../_types/Confirmation";
import { StatusField } from "../_enums/Status";
import Profile from "../models/Profile";
import { bad, error, notFound, unauthorized } from "../util/error";
import { IProfile } from "../_types/Profile";
import * as EventController from "./EventController";
import { getStatus, updateStatus } from "./StatusController";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { ObjectId } from "bson";

const upload = multer({ storage: multer.memoryStorage() });

const generateRandomName = (): string => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    style: "capital",
  });
};

/**
 * File parsing middleware
 */
export const fileMiddleware = upload.single("file");

/**
 * Submit a user's profile or update it if it already exists
 */
export const getProfile = async (userId: ObjectId): Promise<IProfile> => {
  const tartanhacks = await EventController.getTartanHacks();
  return await Profile.findOne({
    user: userId,
    event: tartanhacks._id,
  });
};

/**
 * Submit a user's profile or update it if it already exists
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
    const profileArgs = req.body as IProfile;
    // Prevent user from inserting confirmation here
    delete profileArgs.confirmation;

    // Check if display name is taken
    const { displayName } = profileArgs;
    const existingProfile = await Profile.findOne({
      event: tartanhacks._id,
      displayName,
    });
    if (existingProfile) {
      return bad(res, `Display name ${displayName} is taken!`);
    }

    const user = res.locals.user;

    const profile = await Profile.findOneAndUpdate(
      { user: user._id, event: tartanhacks._id },
      {
        displayName: generateRandomName(),
        ...profileArgs,
      },
      {
        upsert: true,
        returnOriginal: false,
      }
    );
    await updateStatus(user._id, StatusField.COMPLETED_PROFILE, true);
    res.json(profile.toJSON());
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

/**
 * Upload a resume into Google Drive
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
    const profile = await getProfile(user._id);
    const { buffer } = req.file;
    const fileId = await uploadResume(buffer, user, profile);
    res.json(fileId);
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

    const updatedProfile = await Profile.findOneAndUpdate(
      { _id: profile._id },
      {
        $set: {
          confirmation,
          updatedAt: new Date(),
        },
      },
      {
        returnOriginal: false,
        runValidators: true,
      }
    );

    await updateStatus(user._id, StatusField.CONFIRMED, true);
    res.json(updatedProfile.toJSON());
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
    res.json(profile.toJSON());
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
  if (!name) {
    return bad(res, "Display name must be specified!");
  }

  const event = await EventController.getTartanHacks();
  const existingProfile = await Profile.findOne({
    event: event._id,
    displayName: name,
  });

  res.status(200).send(existingProfile == null);
};
