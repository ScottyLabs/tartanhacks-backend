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
      url: `${process.env.ROOT_URL}/verify/${verificationToken}`,
    }
  );
};
