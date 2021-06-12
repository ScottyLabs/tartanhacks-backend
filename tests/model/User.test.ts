/**
 * Test suite for the User model
 */
import User from "../../src/models/User";
import { IUser } from "../../src/_types/User";
import { setup, shutdown } from "../app";

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await shutdown();
});

describe("User", () => {
  let user: IUser;
  /**
   * Create a user
   */
  beforeAll(async () => {
    user = new User({
      email: "tartanhacks@scottylabs.org",
      password: "abc123",
      admin: false,
    });
    await user.save();
  });

  describe("Password hashing", () => {
    let userTest: IUser;
    const password = "abc123";
    const badPassword = "123abc";
    const hash = User.generateHash(password);

    // Initialize new user
    beforeAll(async () => {
      userTest = new User({
        email: "tech@scottylabs.org",
        password: hash,
        admin: false,
      });
      await userTest.save();
    });

    it("good password should validate", async () => {
      const result = userTest.checkPassword(password);
      expect(result).toBeTruthy();
    });

    it("bad password should not validate", async () => {
      const result = userTest.checkPassword(badPassword);
      expect(result).toBeFalsy();
    });
  });

  describe("Email verification token", () => {
    it("should encrypt and decrypt properly", () => {
      const emailToken = user.generateEmailVerificationToken();
      const email = User.decryptEmailVerificationToken(emailToken);
      expect(email).toEqual("tartanhacks@scottylabs.org");
    });
  });

  describe("Auth token", () => {
    it("Should encrypt and decrypt properly", () => {
      const authToken = user.generateAuthToken();
      const id = User.decryptAuthToken(authToken);
      expect(id).not.toBeNull();
      expect(id).toEqual(user._id.toString());
    });
  });

  describe("Password reset token", () => {
    it("Should encrypt and decrypt properly", () => {
      const resetToken = user.generatePasswordResetToken();
      const id = User.decryptPasswordResetToken(resetToken);
      expect(id).not.toBeNull();
      expect(id).toEqual(user._id.toString());
    });
  });
});
