/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/**
 * A collection of Jest mock scripts to bypass usual behavior for testing purposes
 */
import nodemailer from "nodemailer";

/**
 * Mock nodemailer so that email services do not send for testing purposes
 */
export const mockNodeMailer = (): void => {
  jest.mock("nodemailer", () => ({
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockReturnValue((options: any, callback: any) => {}),
    }),
    verify: jest.fn().mockReturnValue(true),
  }));
};
