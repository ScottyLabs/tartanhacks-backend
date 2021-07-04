/**
 * Controller for settings
 */
import { Request, Response } from "express";
import { ISettings } from "../_types/Settings";
import Settings from "../models/Settings";
import { parameters } from "../settings.json";
import { DateTime } from "luxon";

/**
 * Express handler for getting settings
 */
export const getSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  const settings = await getInstance();
  res.json(settings.toJSON());
};

/**
 * Express handler for updating settings
 */
export const updateSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  const setting = await Settings.findOneAndUpdate(
    {},
    {
      $set: req.body,
    },
    { new: true, runValidators: true }
  );
  res.json(setting.toJSON());
};

/**
 * Get the singleton settings document
 */
export const getInstance = async (): Promise<ISettings> => {
  return await Settings.findOne({});
};

/**
 * Check whether or not registration for new participants is open
 */
export const isRegistrationOpen = async (): Promise<boolean> => {
  const settings = await getInstance();
  const { timeOpen, timeClose } = settings;
  const timestamp = DateTime.now();

  const dateOpen = DateTime.fromJSDate(timeOpen);
  const dateClose = DateTime.fromJSDate(timeClose);

  const open = timeOpen == null || dateOpen.diff(timestamp).toMillis() <= 0;
  const closed = timeClose != null || timestamp.diff(dateClose).toMillis() > 0;
  return open && !closed;
};

/**
 * Check whether or not confirmation for accepted participants is open
 */
export const isConfirmationOpen = async (): Promise<boolean> => {
  const settings = await getInstance();
  const { timeOpen, timeConfirm } = settings;
  const timestamp = DateTime.now();

  const dateOpen = DateTime.fromJSDate(timeOpen);
  const dateConfirm = DateTime.fromJSDate(timeConfirm);

  const open = timeOpen == null || dateOpen.diff(timestamp).toMillis() <= 0;
  const closed =
    timeConfirm != null || timestamp.diff(dateConfirm).toMillis() > 0;
  return open && !closed;
};

/**
 * Create the singleton settings document or return it if it already exists.
 * This loads the template from `settings.json`
 */
export const createSingleton = async (): Promise<ISettings> => {
  const settings = await getInstance();
  if (settings != null) {
    return settings;
  }
  // Parse the settings template
  const settingParams: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  } = {};
  for (const entry of Object.entries(parameters)) {
    const key = entry[0] as string;
    const definition = entry[1];
    if (definition.value !== 0) {
      settingParams[key] = definition.value;
    }
  }

  // Create the settings document
  const settingsDoc = new Settings(settingParams);
  await settingsDoc.save();
  return settingsDoc;
};
