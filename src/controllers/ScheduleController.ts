import ScheduleItem from "src/models/ScheduleItem";
import { bad, error } from "../util/error";
import { Request, Response } from "express";
import { getTartanHacks } from "./EventController";

export const addNewScheduleItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      startTime,
      endTime,
      location,
      lat,
      lng,
      platform,
      platformUrl,
    } = req.body;

    const event = await getTartanHacks();

    const scheduleItem = new ScheduleItem({
      name: name,
      description: description,
      startTime: startTime,
      endTime: endTime,
      location: location,
      lat: lat,
      lng: lng,
      platform: platform,
      platformUrl: platformUrl,
      event: event,
    });

    await scheduleItem.save();

    const json = scheduleItem.toJSON();
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
