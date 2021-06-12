/**
 * Startup script
 */
import * as SettingsController from "../controllers/SettingsController";
import { sendEmail } from "../services/email";

export const startup = async (): Promise<boolean> => {
  if (!checkEnvironment()) {
    return false;
  }
  await SettingsController.createSingleton();
};

/**
 * Check that all necessary environment variables are defined properly
 * and parse them accordingly
 */
export const checkEnvironment = (): boolean => {
  const port = parseInt(process.env.EMAIL_PORT);
  if (isNaN(port) || port == null) {
    return false;
  }
  return true;
};