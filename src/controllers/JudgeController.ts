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
  console.log(0);
  console.log(emails);
  if (!Array.isArray(emails)) {
    console.log(1);
    return bad(res, "Request body should be an array of emails!");
  }
  console.log(2);

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
  console.log(3);

  res.status(200).send();
}

export async function removeJudges(req: Request, res: Response): Promise<void> {
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
      judge: false,
    }
  );

  res.status(200).send();
}
