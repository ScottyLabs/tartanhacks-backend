/**
 * Service for sending emails to users
 */
import nodemailer, { Transporter } from "nodemailer";
import templates from "../email-templates";
import mustache from "mustache";

/**
 * Send a styled email to recipients
 * @param recipients List of recipient emails
 * @param subject Subject of the email
 * @param templateName Name of the template under `email-templates` to use
 * @param variables Variables to substitute into the template, if any
 * @returns true if the email was sent successfully
 */
export const sendTemplateEmail = async (
  recipients: [string],
  subject: string,
  templateName: string,
  variables: Record<string, string> = {}
): Promise<void> => {
  // if ((process.env.NODE_ENV as string) === "test") {
  //   return;
  // }
  try {
    const transporter = await getTransporter();
    const html = renderTemplate(templateName, variables);

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_CONTACT,
      to: recipients.join(", "),
      subject,
      html,
    });
  } catch (err) {
    console.error("Could not send email");
    throw err;
  }
};

/**
 * Send a plaintext email to recipients
 * @param recipients List of recipient emails
 * @param subject Subject of the email
 * @param text Plaintext body of the email
 * @returns true if the email was sent successfully
 */
export const sendPlaintextEmail = async (
  recipients: [string],
  subject: string,
  text: string
): Promise<void> => {
  try {
    const transporter = await getTransporter();

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_CONTACT,
      to: recipients.join(", "),
      subject,
      text,
    });
  } catch (err) {
    console.error("Could not send email");
    throw err;
  }
};

/**
 * Construct and initialize a connection with the SMTP server
 * @return a {@link Transporter} object which can be used with node-mailer
 */
const getTransporter = async (): Promise<Transporter> => {
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
    throw new Error("Could not connect to SMTP server");
  }

  return transporter;
};

/**
 * Render the contents from an mjml template
 * @param templateName Name of the template to load under `email-templates`
 * @param variables dictionary mapping variables to replace in the template, if any
 * @returns the rendered template
 */
const renderTemplate = (
  templateName: string,
  variables: Record<string, string> = {}
): string => {
  const template = templates[templateName];
  if (template == null) {
    throw new Error(`Unregistered template: ${templateName}`);
  }
  const rendered = mustache.render(template, variables);
  return rendered;
};
