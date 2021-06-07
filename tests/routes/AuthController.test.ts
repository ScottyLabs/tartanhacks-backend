/**
 * Test suite for authentication routes
 */

import chai, { assert } from "chai";
import { app } from "../mochaHooks";

describe("auth", () => {
  describe("register", () => {
    it("should create a user", async () => {
      const response = await chai.request(app).post("/auth/register").send({
        email: "tartanhacks_reg@scottylabs.org",
        password: "abc123",
      });
      assert.ok(response.body);
      const user = response.body;
      assert.equal(user.email, "tartanhacks_reg@scottylabs.org");
    });
  });

  // ensure that multiple registrations with the same email are not allowed
  describe("register duplicate", () => {
    it("should fail", async () => {
      await chai.request(app).post("/auth/register").send({
        email: "tartanhacks@scottylabs.org",
        password: "abc123",
      });
      const response = await chai.request(app).post("/auth/register").send({
        email: "tartanhacks@scottylabs.org",
        password: "def456",
      });
      assert.equal(response.statusCode, 400);
    });
  });

  describe("login", () => {
    it("should work via email password", async () => {
      const register = await chai.request(app).post("/auth/register").send({
        email: "tartanhacks1@scottylabs.org",
        password: "abc123",
      });
      const login = await chai.request(app).post("/auth/login").send({
        email: "tartanhacks1@scottylabs.org",
        password: "abc123",
      });
      assert.equal(login.body._id, register.body._id);
    });

    it("should work via token", async () => {
      const register = await chai.request(app).post("/auth/register").send({
        email: "tartanhacks2@scottylabs.org",
        password: "abc123",
      });
      const token = register.body.token;
      const login = await chai
        .request(app)
        .post("/auth/login")
        .set("x-access-token", token)
        .send();
      assert.equal(login.body._id, register.body._id);
    });
  });
});
