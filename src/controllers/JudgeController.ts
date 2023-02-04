import { Request, Response } from "express";
import User from "../models/User";
import { bad } from "../util/error";

export async function getJudges(req: Request, res: Response): Promise<void> {
  const judges = await User.find({
    $or: [
      {
        judge: true,
      },
      {
        company: { $ne: null },
      },
      {
        admin: true,
      },
    ],
  }).populate("company");

  res.json(judges);
}

// Make judges from a list of emails
export async function makeJudges(req: Request, res: Response): Promise<void> {
  const emails = req.body as string[];
  if (!Array.isArray(emails)) {
    return bad(res, "Request body should be an array of emails!");
  }

  await User.updateMany(
    {
      email: {
        $in: emails,
      },
    },
    {
      judge: true,
    }
  );

  res.status(200).send();
}
