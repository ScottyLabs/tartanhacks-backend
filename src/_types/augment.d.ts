/**
 * This file augments existing types
 */
import { ObjectId } from "mongoose";
import { IUser } from "./User";

/**
 * Extension of the Express Request type interface
 */
declare global {
  // extend Express Request type for user middleware injection
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }

  // extend env type for better intellisense support
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "dev" | "prod";
      PORT: string;
      ROOT_URL: string;
      JWT_SECRET: string;
      AUTH_TOKEN_EXPIRY: string;
      MONGODB_URI: string;
      // email config
      EMAIL_HOST?: string;
      EMAIL_USER?: string;
      EMAIL_PASS?: string;
      EMAIL_PORT?: string;
      EMAIL_TLS?: string;
      EMAIL_CONTACT?: string;
      EMAIL_HEADER_IMAGE?: string;
    }
  }
}