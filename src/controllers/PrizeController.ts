import { Request, Response } from "express";
import Prize from "../models/Prize";
import Sponsor from "../models/Sponsor";
import CheckinItem from "../models/CheckinItem";
import { bad, error, notFound } from "../util/error";
import { getTartanHacks } from "./EventController";

export const getAllPrizes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await Prize.find().populate("provider").populate("winner");

    res.status(200).json(result);
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const getPrizeByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await Prize.findById(id)
      .populate("provider")
      .populate("winner");

    res.json(result);
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const createNewPrize = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, eligibility, sponsorName, requiredTalk } =
      req.body;

    const sponsor = await Sponsor.findOne({ name: sponsorName });
    if (sponsor == null) {
      return notFound(res, "Could not find sponsor with name: " + sponsorName);
    }

    const event = await getTartanHacks();

    const prize = new Prize({
      name: name,
      description: description,
      event: event._id,
      eligibility: eligibility,
      provider: sponsor._id,
    });

    const talk = await CheckinItem.findOne({ name: requiredTalk });
    if (talk != null) {
      prize.requiredTalk = [talk._id];
    }

    await prize.save();

    const json = prize.toJSON();
    res.json({
      ...json,
    });
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const editPrize = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Prize ID.");
  }

  try {
    await Prize.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true },
      function (err, result) {
        if (err) {
          console.error(err);
          return error(res);
        }

        const json = result.toJSON();
        res.json({
          ...json,
        });
      }
    );
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const deletePrize = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Prize ID.");
  }

  try {
    await Prize.findByIdAndDelete(id);

    res.status(200).json({
      message: "Successfully deleted prize.",
    });
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};
