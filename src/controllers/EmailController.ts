/**
 * Controller for emails
 */
import { sendTemplateEmail } from "../services/email";

/**
 * Send a verification email to a specific address
 * @param email recipient email
 * @param verificationToken verification token to include in the email
 */
export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
  redirectUrl?: string
): Promise<void> => {
  const baseUrl = redirectUrl ?? `${process.env.FRONTEND_URL}`;
  await sendTemplateEmail(
    [email],
    "[TartanHacks] Verify your email",
    "verification",
    {
      url: `${baseUrl}/auth/verify/${verificationToken}`,
    }
  );
};

/**
 * Send a password reset email to a specific address
 * @param email recipient email
 * @param passwordResetToken token to reset the password
 */
export const sendPasswordResetEmail = async (
  email: string,
  passwordResetToken: string,
  redirectUrl?: string
): Promise<void> => {
  const baseUrl = redirectUrl ?? `${process.env.FRONTEND_URL}`;
  await sendTemplateEmail(
    [email],
    "[TartanHacks] Reset your password",
    "password-reset",
    {
      url: `${baseUrl}/auth/reset/${passwordResetToken}`,
    }
  );
};

/**
 * Send an email to let recruiter sign up with a new password
 * @param email recipient email
 * @param name name of the recruiter
 * @param passwordResetToken token to reset the password
 */
export const sendRecruiterCreationEmail = async (
  email: string,
  password: string,
  name: string
): Promise<void> => {
  await sendTemplateEmail(
    [email],
    "[TartanHacks] Welcome to TartanHacks!",
    "recruiter-signup",
    {
      name,
      email,
      password,
    }
  );
};

export const sendStatusUpdateEmail = async (
  email: string,
  name: string,
  redirectUrl?: string
): Promise<void> => {
  const url = redirectUrl ?? `${process.env.FRONTEND_URL}`;
  await sendTemplateEmail(
    [email],
    "[TartanHacks] Update regarding your application",
    "status-update",
    {
      name,
      url,
    }
  );
};
