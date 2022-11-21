import { Request, Response } from "express";
import Profile from "../../models/Profile";
import { Status } from "../../_enums/Status";
import User from "../../models/User";
import { bad, notFound } from "../../util/error";
import { createTestAccountWithStatus } from "./accountCreator";

/**
 * Create a new test account
 */
export async function createNewTestAccount(
  req: Request,
  res: Response
): Promise<void> {
  const status = req.body.status as Status;

  const account = await createTestAccountWithStatus(status);

  res.json(account);
}

/**
 * Delete a test account given a user id
 */
export async function deleteTestAccount(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return notFound(res, `No such user with id: ${id}`);
  }

  if (!user.email.endsWith("tartanhacks.com")) {
    return bad(res, "User is not a test account!");
  }

  await Profile.findByIdAndDelete(id);
  await user.delete();
  res.status(200).send();
}

/**
 * Delete all test accounts
 */
export async function deleteAllTestAccounts(
  req: Request,
  res: Response
): Promise<void> {
  const testAccountFilter = { email: /[a-zA-Z0-9-]+@tartanhacks\.com/ };

  const users = await User.find(testAccountFilter);
  const deleteIds = users.map((user) => user._id);

  await Profile.deleteMany({
    user: {
      $in: deleteIds,
    },
  });
  await User.deleteMany(testAccountFilter);

  res.status(200).send();
}
