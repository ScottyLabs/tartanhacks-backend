import Checkin from "src/models/Checkin";
import CheckinItem from "src/models/CheckinItem";
import Profile from "src/models/Profile";
import { bad, error } from "../util/error";
import { Request, Response } from "express";
import { getTartanHacks } from "./EventController";

export const addNewCheckInItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      startTime,
      endTime,
      points,
      accessLevel,
      enableSelfCheckin,
    } = req.body;

    const event = await getTartanHacks();

    const checkInItem = new CheckinItem({
      name: name,
      description: description,
      startTime: startTime,
      endTime: endTime,
      points: points,
      accessLevel: accessLevel,
      enableSelfCheckin: enableSelfCheckin,
      event: event,
    });

    await checkInItem.save();

    const json = checkInItem.toJSON();
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

export const editCheckInItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Check In Item ID.");
  }

  try {
    await CheckinItem.findByIdAndUpdate(
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

export const getCheckInItemByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await CheckinItem.findById(id);

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

export const getAllCheckInItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await CheckinItem.find();

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

export const getLeaderBoard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await Profile.find()
      .select(["firstName", "totalPoints", "_id", "user"])
      .sort("totalPoints");

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
