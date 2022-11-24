import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export { Transporter } from "nodemailer";

class MockedTransporter {
  async verify(): Promise<boolean> {
    return true;
  }

  async sendMail(options: Mail.Options): Promise<null> {
    console.log("Sending mocked email");
    return null;
  }
}

// Mock the createTransport function of `nodemailer`
function createTransport(options: SMTPTransport.Options): MockedTransporter {
  return new MockedTransporter();
}

export default {
  createTransport,
};
