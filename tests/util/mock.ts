/**
 * A collection of Jest mock scripts to bypass usual behavior for testing purposes
 */
/* eslint-disable @typescript-eslint/no-empty-function */
import nodemailer from "nodemailer";

/**
 * Mock nodemailer so that email services do not send for testing purposes
 */
export const mockNodeMailer = async (): Promise<void> => {
  jest.mock("nodemailer");
  const { user, pass } = await nodemailer.createTestAccount();
  const fakeTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user,
      pass,
    },
  });
  const mockedNodeMailer = nodemailer as jest.Mocked<typeof nodemailer>;
  mockedNodeMailer.createTransport.mockReturnValue(fakeTransporter);
};
