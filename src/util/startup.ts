/**
 * Startup script
 */
import * as SettingsController from "../controllers/SettingsController";
import * as EventController from "../controllers/EventController";
import { createGrandPrize } from "../controllers/ProjectsController";

export const startup = async (): Promise<boolean> => {
  if (!checkEnvironment()) {
    return false;
  }
  await SettingsController.createSingleton();
  await EventController.getTartanHacks();
  await createGrandPrize();
  return true;
};

/**
 * Check that all necessary environment variables are defined properly
 * and parse them accordingly
 */
export const checkEnvironment = (): boolean => {
  const emailPort = parseInt(process.env.EMAIL_PORT);
  if (isNaN(emailPort) || emailPort == null) {
    console.error("Invalid email port:", emailPort);
    return false;
  }
  return true;
};
