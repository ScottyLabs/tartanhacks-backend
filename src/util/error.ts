import { Response } from "express";

/**
 * Respond to the client for a bad request (400)
 * @param res response for interacting with the client
 * @param message message to send to the user
 */
export const bad = (res: Response, message?: string): void => {
  if (!message) {
    res.status(400).json("Bad request");
  } else {
    res.status(400).json({ message });
  }
};

/**
 * Respond to the client for unauthorized request (403)
 * @param res response for interacting with the client
 * @param message message to send to the user
 */
export const unauthorized = (res: Response, message?: string): void => {
  if (!message) {
    res.status(403).send("Unauthorized");
  } else {
    res.status(403).json({ message });
  }
};

/**
 * Respond to the client for internal server error (500)
 * @param res response for interacting with the client
 * @param message message to send to the user
 */
export const error = (res: Response, message?: string): void => {
  if (!message) {
    res.status(500).send("Internal server error");
  } else {
    res.status(500).json({ message });
  }
};
