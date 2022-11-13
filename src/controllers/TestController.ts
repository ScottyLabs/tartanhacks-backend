import { Request, Response } from "express";
import User from "src/models/User";
import { bad, notFound } from "src/util/error";
import { animals, colors, uniqueNamesGenerator } from "unique-names-generator";

/**
 * Create a new test account
 */
export async function createNewTestAccount(
  req: Request,
  res: Response
): Promise<void> {
  const prefix = uniqueNamesGenerator({
    dictionaries: [animals, colors],
    separator: "-",
    length: 2,
  });
  const email = `${prefix}@tartanhacks.com`;
  const password = uniqueNamesGenerator({
    dictionaries: [animals, colors],
    length: 1,
  });
  const hash = User.generateHash(password);

  const user = new User({ email, password: hash });
  await user.save();

  const token = await user.generateAuthToken();
  res.json({ ...user.toJSON(), password, token });
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
  await User.deleteMany({
    email: /[a-zA-Z0-9-]+@tartanhacks\.com/,
  });

  res.status(200).send();
}
