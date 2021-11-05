import Checkin from "../models/Checkin";
import CheckinItem from "../models/CheckinItem";
import Profile from "../models/Profile";
import { bad, error } from "../util/error";
import { Request, Response } from "express";
import { getTartanHacks } from "./EventController";
import User from "../models/User";
import { ICheckinItem } from "../_types/CheckinItem";
import { getProfile } from "./ProfileController";

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
      enableSelfCheckIn,
    } = req.body;

    const event = await getTartanHacks();

    const checkInItem = new CheckinItem({
      name: name,
      description: description,
      startTime: startTime,
      endTime: endTime,
      points: points,
      accessLevel: accessLevel,
      enableSelfCheckin: enableSelfCheckIn,
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

export const deleteCheckInItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Check In Item ID.");
  }

  try {
    await CheckinItem.findByIdAndDelete(id);

    res.status(200).json({
      message: "Successfully deleted check in item.",
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

export const getLeaderBoard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tartanhacks = await getTartanHacks();
    const ranked = await Profile.aggregate([
      {
        $match: {
          event: tartanhacks._id,
        },
      },
      {
        $sort: {
          totalPoints: -1,
          displayName: 1,
        },
      },
      {
        $group: {
          _id: {},
          items: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $unwind: {
          path: "$items",
          includeArrayIndex: "items.rank",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$items",
        },
      },
      {
        $project: {
          _id: 0,
          user: 1,
          totalPoints: 1,
          displayName: 1,
          rank: 1,
        },
      },
    ]);

    res.status(200).json(ranked);
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const getLeaderBoardPosition = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tartanhacks = await getTartanHacks();
  const user = res.locals.user;
  const profile = await getProfile(user._id);

  if (profile == null) {
    return bad(res, "User does not have a profile yet!");
  }

  const matchingProfiles = await Profile.aggregate([
    {
      $match: {
        event: tartanhacks._id,
      },
    },
    {
      $sort: {
        totalPoints: -1,
        displayName: 1,
      },
    },
    {
      $group: {
        _id: {},
        items: {
          $push: "$$ROOT",
        },
      },
    },
    {
      $unwind: {
        path: "$items",
        includeArrayIndex: "items.rank",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$items",
      },
    },
    {
      $match: {
        user: user._id,
      },
    },
    {
      $project: {
        _id: 0,
        user: 1,
        totalPoints: 1,
        displayName: 1,
        rank: 1,
      },
    },
  ]);

  if (matchingProfiles.length == 0) {
    return bad(res, "User is not on the leaderboard!");
  }

  const userProfile = matchingProfiles[0];

  res.json(userProfile.rank);
};

export const checkInUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { checkInItemID, userID } = req.query;

    const event = await getTartanHacks();
    const user = await User.findById(userID);
    const profile = await Profile.findOne({ user: user._id });
    const item = await CheckinItem.findById(checkInItemID);
    const checkIn = new Checkin({
      user: user._id,
      item: item._id,
      event: event,
    });

    profile.totalPoints += item.points;

    await checkIn.save();
    await profile.save();

    const json = checkIn.toJSON();
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

interface checkInHistory {
  checkInItem: ICheckinItem;
  hasCheckedIn: boolean;
}

export const getCheckInHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    const profile = await Profile.findOne({ user: user._id });
    const tartanHacks = await getTartanHacks();
    const checkInItems = await CheckinItem.find({
      event: tartanHacks._id,
    }).sort("startTime");
    const result: checkInHistory[] = [];
    for (let i = 0; i < checkInItems.length; i++) {
      const histories = await Checkin.find({
        user: user._id,
        item: checkInItems[i]._id,
      });
      const history: checkInHistory = {
        checkInItem: checkInItems[i],
        hasCheckedIn: histories.length !== 0,
      };
      result.push(history);
    }

    res.json({
      displayName: profile.displayName,
      totalPoints: profile.totalPoints,
      history: result,
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
