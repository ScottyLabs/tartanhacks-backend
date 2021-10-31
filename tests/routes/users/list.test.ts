/**
 * Test suite for list users
 */
import { Express } from "express";
import request from "supertest";
import { setup, getApp, shutdown } from "../../index";
import User from "src/models/User";

let app: Express = null;

beforeAll(async () => {
  await setup();
  app = getApp();
});

afterAll(async () => {
  await shutdown();
});

describe("list", () => {
  // Should retrieve all users
  it("should retrieve all users", async () => {
    const user_count = 3;
    const ids = [];
    let token;
    // Generate accounts
    for (let i = 0; i < user_count; i++) {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: `dummy${i}@scottylabs.org`,
          password: "abc123",
        });
      expect(response.body._id).not.toBeNull();
      ids.push(response.body._id);
      if (i == 0) {
        token = response.body.token;
      }
    }
    expect(ids.length).toEqual(user_count);

    // Make first user an admin
    const admin = await User.findById(ids[0]);
    expect(admin).not.toBeNull();

    admin.admin = true;
    await admin.save();

    const response = await request(app)
      .get("/users")
      .set("x-access-token", token);
    expect(response.body.length).toEqual(user_count);
  });
});
