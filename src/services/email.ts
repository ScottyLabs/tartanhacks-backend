import nodemailer from "nodemailer";

/**
 * Send an email to recipients
 * @param recipients List of recipient emails
 * @param subject Subject of the email
 * @param plaintext Plain text body ofthe email (or omit if using html)
 * @param html HTML body of the email (or omit if using plaintext)
 * @returns true if the email was sent successfully
 */
export const sendEmail = async (
  recipients: [string],
  subject: string,
  plaintext?: string,
  html?: string
): Promise<boolean> => {
  try {
    // Initialize SMTP connection
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_TLS == "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify that connection was successful
    const connected = await transporter.verify();
    if (!connected) {
      console.error("Could not connect to SMTP server");
      return false;
    }

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_CONTACT,
      to: recipients.join(", "),
      subject,
      text: plaintext,
      html,
    });

    return true;
  } catch (err) {
    console.error("Could not send email");
    console.error(err);
  }
  return false;
};
