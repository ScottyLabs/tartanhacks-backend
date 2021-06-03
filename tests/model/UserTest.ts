import UserSchema from "../../src/models/User";
import { User } from "../../src/_types/User";
import assert from "assert";

describe("User", () => {
  describe("User creation", () => {
    it("should save", async () => {
      const user: User = new UserSchema({
        email: "tartanhacks@scottylabs.org",
        password: "abc123",
        admin: false,
      });
      const savedUser: User = await user.save();
      assert(savedUser != null);
    });
  });
});
