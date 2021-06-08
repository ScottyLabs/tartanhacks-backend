/**
 * Startup script
 */
import * as SettingsController from "../controllers/SettingsController";

export const init = async (): Promise<void> => {
  await SettingsController.createSingleton();
};
