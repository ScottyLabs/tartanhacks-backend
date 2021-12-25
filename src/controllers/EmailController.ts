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
  verificationToken: string
): Promise<void> => {
  await sendTemplateEmail(
    [email],
    "[TartanHacks] Verify your email",
    "verification",
    {
      url: `${process.env.FRONTEND_URL}/auth/verify/${verificationToken}`,
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
  passwordResetToken: string
): Promise<void> => {
  await sendTemplateEmail(
    [email],
    "[TartanHacks] Reset your password",
    "password-reset",
    {
      url: `${process.env.FRONTEND_URL}/auth/reset/${passwordResetToken}`,
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
