import ScheduleItem from "../models/ScheduleItem";
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

export const editScheduleItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Schedule Item ID.");
  }

  try {
    await ScheduleItem.findByIdAndUpdate(
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

export const getScheduleItemByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await ScheduleItem.findById(id);

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

export const getAllScheduleItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await ScheduleItem.find();

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

export const deleteScheduleItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Schedule Item ID.");
  }

  try {
    await ScheduleItem.findByIdAndDelete(id);

    res.status(200).json({
      message: "Successfully deleted schedule item.",
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
