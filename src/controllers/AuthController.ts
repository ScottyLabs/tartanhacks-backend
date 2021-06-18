/**
 * Controller for auth routes
 */
import { Request, Response } from "express";
import User from "../models/User";
import { bad, error, notFound } from "../util/error";
import { getByToken } from "./UserController";
import { isRegistrationOpen } from "./SettingsController";
import { sendVerificationEmail } from "./EmailController";
import * as StatusController from "./StatusController";

/**
 * Register a user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const registrationOpen = await isRegistrationOpen();
  if (!registrationOpen) {
    return bad(res, "Registration is closed.");
  }

  if (!password || password.length < 6) {
    return bad(res, "Password must be 6 or more characters.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return bad(res, "An account with that email already exists!");
  }

  const hash = User.generateHash(password);
  const user = new User({ email, password: hash });
  await user.save();

  const token = await user.generateAuthToken();
  const json = user.toJSON();
  delete json.password;
  res.json({
    ...json,
    token,
  });
  await sendVerificationEmail(email, token);
};

/**
 * Login a user with email and password or with a token in the header
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  const { email, password } = req.body;

  if (token) {
    // Login with token
    try {
      const user = await getByToken(token);
      if (!user) {
        return bad(res, "Unknown account");
      }
      const json = user.toJSON();
      delete json.password;
      res.json({
        token,
        ...json,
      });
    } catch (err) {
      error(res, err);
    }
  } else {
    // Login with email & password
    if (!email || !password) {
      bad(res, "Missing email or password");
    } else {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return notFound(res, "Unknown account");
        } else {
          if (!user.checkPassword(password)) {
            return bad(res, "Incorrect password");
          } else {
            // Return json of user without password hash
            const token = user.generateAuthToken();
            const json = user.toJSON();
            delete json.password;
            res.json({ ...json, token });
          }
        }
      } catch (err) {
        error(res, err);
      }
    }
  }
};

/**
 * Verify a user via email
 */
export const verify = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  if (token == null) {
    bad(res, "Missing verification token");
  }

  try {
    const email = User.decryptEmailVerificationToken(token);
    if (email == null) {
      bad(res, "Bad token");
    }

    const user = await User.findOne({ email });
    if (user == null) {
      notFound(res, "User not found");
    }

    await StatusController.verifyUser(user._id);
    const json = user.toJSON();
    delete json.password;
    res.json({ ...json, token });
  } catch (err) {
    bad(res, "An error occured");
  }
};
