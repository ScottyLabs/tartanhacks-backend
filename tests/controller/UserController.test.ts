/**
 * Test suite for the User Controller
 */

import * as UserController from "../controllers/UserController";
import User from "../models/User";
import { setup, shutdown } from "../index";
import { mockNodeMailer } from "../util/mock";

beforeAll(async () => {
  await setup();
  mockNodeMailer();
});

afterAll(async () => {
  await shutdown();
});

describe("UserController", () => {
  describe("getByToken", () => {
    // ensure that getByToken resolves correctly
    it("should match", async () => {
      const user = new User({
        email: "tech@scottylabs.org",
        password: "abc123",
      });
      await user.save();
      const token = user.generateAuthToken();
      const lookup = await UserController.getByToken(token);
      expect(lookup).not.toBeNull();
      expect(lookup._id.toString()).toEqual(user._id.toString());
    });
  });
});
