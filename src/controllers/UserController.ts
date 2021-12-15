import User from "../models/User";
import { IUser } from "../_types/User";

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