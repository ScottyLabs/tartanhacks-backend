/**
 * Configuration for mocking nodemailer during testing
 */
const nodemailer = jest.createMockFromModule("nodemailer") as any;

const defaultPromise = new Promise((resolve, reject) => resolve(true));
const sendMailMock = jest.fn().mockReturnValue(defaultPromise);

nodemailer.createTransport.mockReturnValue({
  sendMail: sendMailMock,
  verify: () => defaultPromise,
});

export default nodemailer;
