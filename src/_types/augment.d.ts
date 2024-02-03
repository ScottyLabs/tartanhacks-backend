/**
 * This file augments existing types
 */

/**
 * Extension of the Express Request type interface
 */
declare global {
  // extend env type for better intellisense support
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "dev" | "stg" | "prod";
      PORT: string;
      BACKEND_URL: string;
      FRONTEND_URL: string;
      JWT_SECRET: string;
      AUTH_TOKEN_EXPIRY: string;
      MONGODB_URI: string;
      JUDGING_URL: string;
      JUDGING_TOKEN: string;
      // object id for the judging expo checkin item
      EXPO_EVENT_ID: string;
      // Email config
      EMAIL_HOST?: string;
      EMAIL_USER?: string;
      EMAIL_PASS?: string;
      EMAIL_PORT?: string;
      EMAIL_TLS?: string;
      EMAIL_CONTACT?: string;
      EMAIL_HEADER_IMAGE?: string;
      // Google drive credentials
      DRIVE_FOLDER_ID?: string;
      DRIVE_CLIENT_ID?: string;
      DRIVE_CLIENT_SECRET?: string;
      DRIVE_ACCESS_TOKEN?: string;
      DRIVE_REFRESH_TOKEN?: string;
      DRIVE_TOKEN_EXPIRY_DATE?: string;
    }
  }
}

export {};
