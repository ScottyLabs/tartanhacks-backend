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

describe("get", () => {
  // Should be able to access own user
  it("can access own", async () => {
    const registerResponse = await request(app).post("/auth/register").send({
      email: `dummy@scottylabs.org`,
      password: "abc123",
    });
    expect(registerResponse.status).toEqual(200);
    const { _id: id, token } = registerResponse.body;
    expect(id).not.toBeNull();

    const getResponse = await request(app)
      .get(`/users/${id}`)
      .set("x-access-token", token)
      .send();

    expect(getResponse.status).toEqual(200);
    expect(getResponse.body._id).toEqual(id);
  });

  // Admins should be able to access another
  it("can be accessed by admin", async () => {
    // Create admin user
    const registerAdminResponse = await request(app)
      .post("/auth/register")
      .send({
        email: `dummy3@scottylabs.org`,
        password: "abc123",
      });
    expect(registerAdminResponse.status).toEqual(200);
    const { _id: adminId, token: adminToken } = registerAdminResponse.body;

    // Make user an admin
    const user = await User.findById(adminId);
    user.admin = true;
    await user.save();

    // Create normal user
    const registerResponse = await request(app).post("/auth/register").send({
      email: `dummy4@scottylabs.org`,
      password: "abc123",
    });
    expect(registerResponse.status).toEqual(200);
    const { _id: normalId } = registerResponse.body;

    const getResponse = await request(app)
      .get(`/users/${normalId}`)
      .set("x-access-token", adminToken)
      .send();

    expect(getResponse.status).toEqual(200);
    expect(getResponse.body._id).toEqual(normalId);
  });

  // Non-admins should not be able to view others
  it("cannot be accessed by non-owner and non-admin", async () => {
    // Create admin user
    const registerResponse1 = await request(app).post("/auth/register").send({
      email: `dummy5@scottylabs.org`,
      password: "abc123",
    });
    expect(registerResponse1.status).toEqual(200);

    const registerResponse2 = await request(app).post("/auth/register").send({
      email: `dummy6@scottylabs.org`,
      password: "abc123",
    });
    expect(registerResponse2.status).toEqual(200);

    const { _id: user1Id } = registerResponse1.body;
    const { token: user2Token } = registerResponse2.body;

    const getResponse = await request(app)
      .get(`/users/${user1Id}`)
      .set("x-access-token", user2Token)
      .send();

    expect(getResponse.status).toEqual(403);
  });
});
