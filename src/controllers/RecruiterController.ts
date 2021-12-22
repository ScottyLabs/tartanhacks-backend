import { randomBytes } from "crypto";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import RecruiterProfile from "../models/RecruiterProfile";
import Sponsor from "../models/Sponsor";
import User from "../models/User";
import { bad, notFound } from "../util/error";
import { sendRecruiterCreationEmail } from "./EmailController";
import { getTartanHacks } from "./EventController";

/**
 * Generate a random password of a specified length
 */
const generateRandomPassword = (length: number): string => {
  const buf = randomBytes(Math.ceil(length / 2));
  return buf.toString("hex").substring(0, length);
};

/**
 * Create a new recruiter user and their associated recruiter profile
 */
export const createRecruiter = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { sponsorId, email, firstName, lastName } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    return bad(res, "User already exists");
  }

  const company = await Sponsor.findOne({
    event: event._id,
    _id: new ObjectId(sponsorId),
  });

  if (!company) {
    return notFound(res, "Sponsor company not found");
  }

  const password = generateRandomPassword(8);
  const hash = User.generateHash(password);
  const recruiter = new User({
    email,
    password: hash,
    company: company._id,
  });
  await recruiter.save();

  const recruiterProfile = new RecruiterProfile({
    event: event._id,
    user: recruiter._id,
    firstName,
    lastName,
  });
  await recruiterProfile.save();
  await sendRecruiterCreationEmail(email, password, firstName);

  res.json(recruiter.toJSON());
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
