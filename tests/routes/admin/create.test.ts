/**
 * Test suite for promoting users to admin
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

describe("creation", () => {
  it("should make user an admin", async () => {
    //  Create user to use as admin
    const adminRegisterResponse = await request(app)
      .post("/auth/register")
      .send({
        email: "dummy@scottylabs.org",
        password: "abc123",
      });
    expect(adminRegisterResponse.status).toEqual(200);
    const { _id } = adminRegisterResponse.body;
    const adminUser = await User.findById(_id);
    adminUser.admin = true;
    await adminUser.save();
    const adminToken = adminUser.generateAuthToken();

    // Create user to promote
    const userRegisterResponse = await request(app).post("/auth/register").send({
      email: "dummy1@scottylabs.org",
      password: "abc123",
    });
    expect(userRegisterResponse.status).toEqual(200);
    const { _id: userId, token: userToken } = userRegisterResponse.body;

    //  Promote user to admin
    const promoteResponse = await request(app)
      .post(`/admin/${userId}`)
      .set("x-access-token", adminToken)
      .send();
    expect(promoteResponse.status).toEqual(200);

    //  Login user to get details
    const loginResponse = await request(app)
      .post("/auth/login")
      .set("x-access-token", userToken)
      .send();
    expect(loginResponse.status).toEqual(200);

    // Promoted user should now be an admin
    const user = loginResponse.body;
    expect(user).not.toBeNull();
    expect(user.admin).toEqual(true);
  });

  it("should fail for non-admin calls", async () => {
    // Create user to try promoting
    const userRegisterResponse = await request(app).post("/auth/register").send({
      email: "dummy2@scottylabs.org",
      password: "abc123",
    });
    expect(userRegisterResponse.status).toEqual(200);
    const { _id: userId, token: userToken } = userRegisterResponse.body;

    //  Attempt to promote user
    const promoteResponse = await request(app)
      .post(`/admin/${userId}`)
      .set("x-access-token", userToken)
      .send();
    expect(promoteResponse.status).toEqual(401);

    //  Login user to get details
    const loginResponse = await request(app)
      .post("/auth/login")
      .set("x-access-token", userToken)
      .send();
    expect(loginResponse.status).toEqual(200);

    // User should not be an admin
    const user = loginResponse.body;
    expect(user).not.toBeNull();
    expect(user.admin).toEqual(false);
  });
});
