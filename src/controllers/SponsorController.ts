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
    return bad(res, "Sponsor exists with the same name: " + name);
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

  const sponsor = await Sponsor.findById(id).select(["_id", "name"]);
  if (sponsor == null) {
    return notFound(res, "Sponsor not found");
  }

  const recruiters = await User.find({
    company: sponsor._id,
  }).select("_id email");

  res.json({
    ...sponsor.toJSON(),
    recruiters,
  });
};

/**
 * Get list of all sponsors
 */
export const getSponsors = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tartanhacks = await getTartanHacks();
  const sponsors = await Sponsor.find({ event: tartanhacks._id }).select([
    "_id",
    "name",
  ]);

  res.json(sponsors);
};
