import { IUser } from "./User";

/**
 * Extension of the Express Request type interface
 */
declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}
