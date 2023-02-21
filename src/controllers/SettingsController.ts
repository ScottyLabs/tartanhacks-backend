/**
 * Controller for settings
 */
import { Settings } from "@prisma/client";
import { Request, Response } from "express";
import { DateTime } from "luxon";
import ServerError from "src/errors/ServerError";

/**
 * Retrieve the application settings
 * @throws {ServerError} if a settings singleton does not exist
 */
export async function getSettings(): Promise<Settings> {
  const settings = await prisma.settings.findFirst();

  if (settings == null) {
    throw new ServerError(
      "Missing settings object! Has the database been seeded?"
    );
  }
  return settings;
}

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
