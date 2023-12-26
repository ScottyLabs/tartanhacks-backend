/**
 * Controller for settings
 */
import { Request, Response } from "express";
import { ISettings } from "../_types/Settings";
import Settings from "../models/Settings";
import { parameters } from "../settings.json";
import { DateTime } from "luxon";
import { getTartanHacks } from "./EventController";

/**
 * Express handler for getting settings
 */
export const handleGetSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  const settings = await getSettings();
  res.json(settings.toJSON());
};

/**
 * Express handler for getting the waitlist status
 */
export const handleGetWaitlistStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const settings = await getSettings();
  res.json({
    waitlist: settings.autoWaitlist,
  });
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
export const getSettings = async (): Promise<ISettings> => {
  const event = await getTartanHacks();
  const settings = await Settings.findOne({ event: event._id });
  return settings;
};

/**
 * Check whether or not registration for new participants is open
 */
export const isRegistrationOpen = async (): Promise<boolean> => {
  const settings = await getSettings();
  const { timeOpen, timeClose } = settings;
  const timestamp = DateTime.now();

  const dateOpen = DateTime.fromJSDate(new Date(timeOpen));
  const dateClose = DateTime.fromJSDate(new Date(timeClose));

  const open = timeOpen == null || dateOpen.diff(timestamp).toMillis() <= 0;
  const closed = timeClose != null && timestamp.diff(dateClose).toMillis() > 0;

  return open && !closed;
};

/**
 * Check whether or not confirmation for accepted participants is open
 */
export const isConfirmationOpen = async (): Promise<boolean> => {
  const settings = await getSettings();
  const { timeOpen, timeConfirm } = settings;
  const timestamp = DateTime.now();

  const dateOpen = DateTime.fromJSDate(new Date(timeOpen));
  const dateConfirm = DateTime.fromJSDate(new Date(timeConfirm));

  const open = timeOpen == null || dateOpen.diff(timestamp).toMillis() <= 0;
  const closed =
    timeConfirm != null && timestamp.diff(dateConfirm).toMillis() > 0;
  return open && !closed;
};

/**
 * Create the singleton settings document or return it if it already exists.
 * This loads the template from `settings.json`
 * Populates any missing setting values from the template
 */
export const createSingleton = async (): Promise<ISettings> => {
  const settings = await getSettings();
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
  const event = await getTartanHacks();
  settingParams["event"] = event._id;

  if (settings) {
    const update = {
      ...settingParams,
      ...settings.toJSON(),
    };
    const updatedSettings = await settings.updateOne(
      {
        $set: update,
      },
      { new: true }
    );
    return updatedSettings;
  } else {
    // Create the settings document
    const settingsDoc = new Settings(settingParams);
    await settingsDoc.save();
    return settingsDoc;
  }
};

/**
 * Get the time that registration opens
 */
export const getOpenTime = async (
  req: Request,
  res: Response
): Promise<void> => {
  const settings = await getSettings();
  if (settings && settings.timeOpen) {
    res.json(settings.timeOpen);
  } else {
    res.status(404).send();
  }
};

/**
 * Get the time that registration closes
 */
export const getCloseTime = async (
  req: Request,
  res: Response
): Promise<void> => {
  const settings = await getSettings();
  if (settings && settings.timeClose) {
    res.json(settings.timeClose);
  } else {
    res.status(404).send();
  }
};

/**
 * Get the confirmation deadline
 */
export const getConfirmTime = async (
  req: Request,
  res: Response
): Promise<void> => {
  const settings = await getSettings();
  if (settings && settings.timeConfirm) {
    res.json(settings.timeConfirm);
  } else {
    res.status(404).send();
  }
};
