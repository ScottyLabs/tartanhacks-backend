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
      NODE_ENV: "dev" | "prod";
      PORT: string;
      BACKEND_URL: string;
      FRONTEND_URL: string;
      DISCORD_URL: string;
      JWT_SECRET: string;
      AUTH_TOKEN_EXPIRY: string;
      MONGODB_URI: string;
      // Email config
      EMAIL_HOST?: string;
      EMAIL_USER?: string;
      EMAIL_PASS?: string;
      EMAIL_PORT?: string;
      EMAIL_TLS?: string;
      EMAIL_CONTACT?: string;
      EMAIL_HEADER_IMAGE?: string;
      // Google Cloud credentials
      GCP_CLIENT_EMAIL?: string;
      GCP_PRIVATE_KEY?: string;
      GCP_PROJECT_ID?: string;
    }
  }
}

export {};
