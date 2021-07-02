import Checkin from "src/models/Checkin";
import CheckinItem from "src/models/CheckinItem";
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
