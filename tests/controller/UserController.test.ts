/**
 * Test suite for the User Controller
 */

import { assert } from "chai";
import { getByToken } from "../../src/controllers/UserController";
import User from "../../src/models/User";

describe("UserController", () => {
  describe("getByToken", () => {
    // ensure that getByToken resolves correctly
    it("should match", async () => {
      const user = new User({
        email: "tartanhacks@scottylabs.org",
        password: "abc123",
      });
      await user.save();
      const token = user.generateAuthToken();
      const lookup = await getByToken(token);
      assert.equal(lookup._id.toString(), user._id.toString());
    });
  });
});
