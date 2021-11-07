import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import Sponsor from "../models/Sponsor";
import User from "../models/User";
import { bad, notFound } from "../util/error";
import { IUser } from "../_types/User";
import { getTartanHacks } from "./EventController";

/**
 * Get a User by their authentication token
 * @param token authentication token
 * @returns the user associated with the login authentication token
 */
export const getByToken = async (token: string): Promise<IUser> => {
  try {
    const id = User.decryptAuthToken(token);
    const user = await User.findById(id);
    return user;
  } catch (err) {
    return null;
  }
};

/**
 * Make a user into a recruiter
 */
export const makeRecruiter = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { id } = req.params;
  const { sponsor } = req.body;

  const user = await User.findOne({ _id: new ObjectId(id) });
  if (!user) {
    return notFound(res, "User not found");
  }
  if (user.company) {
    return bad(res, "User is already a recruiter");
  }

  const sponsorDoc = await Sponsor.findOne({
    _id: new ObjectId(sponsor),
    event: event._id,
  });
  if (!sponsorDoc) {
    return notFound(res, "Sponsor not found");
  }

  user.company = sponsorDoc._id;
  await user.save();
  res.json(user.toJSON());
};

/**
 * Demote an existing recruiter
 */
export const removeRecruiter = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { id } = req.params;

  const user = await User.findOne({ _id: new ObjectId(id) });
  if (!user) {
    return notFound(res, "User not found");
  }
  if (!user.company) {
    return bad(res, "User is not a recruiter");
  }
  delete user.company;
  await user.save();
  res.json(user.toJSON());
};

/**
 * Find if a user exists via emial
 */
export const userExists = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    return bad(res, "Missing email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    return notFound(res, `There is no registered user with the email ${email}`);
  }
  res.status(200).send();
};
