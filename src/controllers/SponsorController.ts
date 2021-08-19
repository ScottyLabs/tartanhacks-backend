import { Request, Response } from "express";
import Sponsor from "../models/Sponsor";
import User from "../models/User";
import { bad, notFound } from "../util/error";
import { getTartanHacks } from "./EventController";

/**
 * Create a new sponsor (company)
 */
export const createSponsor = async (
  req: Request,
  res: Response
): Promise<void> => {
  const event = await getTartanHacks();
  const { name } = req.body;
  if (!name) {
    return bad(res, "Missing name");
  }

  const existing = await Sponsor.findOne({ name, event: event._id });
  if (existing) {
    return bad(res, "Sponsor with that name already exists!");
  }

  const sponsor = new Sponsor({
    name,
    event: event._id,
  });
  await sponsor.save();
  res.json(sponsor);
};

/**
 * Get a sponsor and associated recruiter users
 */
export const getSponsor = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const sponsor = await Sponsor.findById(id);
  if (sponsor == null) {
    return notFound(res, "Sponsor not found");
  }

  const event = await getTartanHacks();
  const recruiters = await User.find({
    company: sponsor._id,
    event: event._id,
  });

  res.json({
    ...sponsor,
    recruiters,
  });
};
