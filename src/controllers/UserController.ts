import User from "../models/User";
import { IUser } from "../_types/User";
import { Request, Response } from "express";
import { bad, error, notFound, unauthorized } from "../util/error";

/**
 * Get a User by their authentication token
 * @param token authentication token
 * @returns the user associated with the login authentication token
 */
export const getByToken = async (token: string): Promise<IUser> => {
  try {
    const id = User.decryptAuthToken(token);
    const user = await User.findById(id);
    return user;
  } catch (err) {
    return null;
  }
};

/**
 * Get a User by their verification code
 * @param code verification code
 * @returns the user associated with the verification code, if it is not expired
 */
export const getByCode = async (code: string): Promise<IUser> => {
  try {
    const user = await User.findOne({ verificationCode: code });
    if (new Date() <= user.verificationExpiry) {
      return user;
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
};

/**
 * Get the current verification code, or generate a new one if it is expired
 */
export const getOwnVerificationCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = res.locals.user;

  try {
    if (!user.verificationCode || user.verificationExpiry <= new Date()) {
      await user.updateVerificationCode();
    }

    res
      .status(200)
      .json({
        code: user.verificationCode,
        expiry: user.verificationExpiry,
        link: process.env.DISCORD_URL,
      });
  } catch (err) {
    console.log(err);
    error(res);
  }
};
