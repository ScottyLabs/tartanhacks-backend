import User from "src/models/User";
import { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
    return;
  } catch (error) {
    res.status(500).json(error);
    return;
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    err.reason = err.reason.message;
    res.status(500).json(err);
  }
};
