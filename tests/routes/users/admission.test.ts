/**
 * Test suite for list users
 */
import { Express } from "express";
import request from "supertest";
import { setup, getApp, shutdown } from "../../index";
import User from "src/models/User";
import { Status } from "src/_enums/Status";
import { ObjectId } from "mongodb";

let app: Express = null;
let adminId: string = null;
let adminToken: string = null;

beforeAll(async () => {
  await setup();
  app = getApp();

  const adminRegisterResponse = await request(app).post("/auth/register").send({
    email: `dummy@scottylabs.org`,
    password: "abc123",
  });
  expect(adminRegisterResponse.status).toEqual(200);
  const { _id, token } = adminRegisterResponse.body;
  adminId = _id;
  adminToken = token;

  // Make user an admin
  const admin = await User.findById(adminId);
  admin.admin = true;
  await admin.save();
});

afterAll(async () => {
  await shutdown();
});

describe("admission", () => {
  it("should work for admins", async () => {
    // Register user to admit
    const registerResponse = await request(app).post("/auth/register").send({
      email: `dummy1@scottylabs.org`,
      password: "abc123",
    });
    expect(registerResponse.status).toEqual(200);
    const { _id: userId } = registerResponse.body;

    // Update status so user appears to have completed profile
    await User.findByIdAndUpdate(userId, { status: Status.COMPLETED_PROFILE });

    // Admit user
    const admitResponse = await request(app)
      .post(`/users/${userId}/admit`)
      .set("x-access-token", adminToken);
    expect(admitResponse.status).toEqual(200);

    // Check that status is true
    const user = await User.findById(userId);
    expect(user).not.toBeNull();
    expect(user.status).toBe(Status.ADMITTED);
  });

  it("should fail for incomplete profiles", async () => {
    // Register user to admit
    const registerResponse = await request(app).post("/auth/register").send({
      email: `dummy2@scottylabs.org`,
      password: "abc123",
    });
    expect(registerResponse.status).toEqual(200);
    const { _id: userId } = registerResponse.body;

    // Update status so user appears to have verified account
    await User.findByIdAndUpdate(userId, { status: Status.VERIFIED });

    // Admit user
    const admitResponse = await request(app)
      .post(`/users/${userId}/admit`)
      .set("x-access-token", adminToken);
    expect(admitResponse.status).toEqual(400);

    // Check that status is not updated
    const user = await User.findById(userId);
    expect(user).not.toBeNull();
    expect(user.status).toBe(Status.VERIFIED);
  });

  it("should be inaccessible to non-admins", async () => {
    // Register user to attempt admission
    const registerAttackerResponse = await request(app)
      .post("/auth/register")
      .send({
        email: `dummy3@scottylabs.org`,
        password: "abc123",
      });
    expect(registerAttackerResponse.status).toEqual(200);
    const { token: attackerToken } = registerAttackerResponse.body;

    // Register user to admit
    const registerApplicantResponse = await request(app)
      .post("/auth/register")
      .send({
        email: `dummy4@scottylabs.org`,
        password: "abc123",
      });
    expect(registerApplicantResponse.status).toEqual(200);
    const { _id: userId } = registerApplicantResponse.body;

    // Update status so user appears to have verified account
    await User.findByIdAndUpdate(userId, { status: Status.COMPLETED_PROFILE });

    // Attempt admitting user
    const admitResponse = await request(app)
      .post(`/users/${userId}/admit`)
      .set("x-access-token", attackerToken);
    expect(admitResponse.status).toEqual(403);

    // Check that status is not updated
    const user = await User.findById(userId);
    expect(user).not.toBeNull();
    expect(user.status).toBe(Status.COMPLETED_PROFILE);
  });
});

describe("rejection", () => {
  it("should work for admins", async () => {
    // Register user to reject
    const registerResponse = await request(app).post("/auth/register").send({
      email: `dummy5@scottylabs.org`,
      password: "abc123",
    });
    expect(registerResponse.status).toEqual(200);
    const { _id: userId } = registerResponse.body;

    // Update status so user appears to have completed profile
    await User.findByIdAndUpdate(userId, { status: Status.COMPLETED_PROFILE });

    // Reject user
    const admitResponse = await request(app)
      .post(`/users/${userId}/reject`)
      .set("x-access-token", adminToken);
    expect(admitResponse.status).toEqual(200);

    // Check that status is false
    const user = await User.findById(userId);
    expect(user).not.toBeNull();
    expect(user.status).toBe(Status.REJECTED);
  });

  it("should fail for incomplete profiles", async () => {
    // Register user to reject
    const registerResponse = await request(app).post("/auth/register").send({
      email: `dummy6@scottylabs.org`,
      password: "abc123",
    });
    expect(registerResponse.status).toEqual(200);
    const { _id: userId } = registerResponse.body;

    // Update status so user appears to have verified account
    await User.findByIdAndUpdate(userId, { status: Status.VERIFIED });

    // Reject user
    const admitResponse = await request(app)
      .post(`/users/${userId}/reject`)
      .set("x-access-token", adminToken);
    expect(admitResponse.status).toEqual(400);

    // Check that status is not updated
    const user = await User.findById(userId);
    expect(user).not.toBeNull();
    expect(user.status).toBe(Status.VERIFIED);
  });

  it("should be inaccessible to non-admins", async () => {
    // Register user to attempt rejection
    const registerAttackerResponse = await request(app)
      .post("/auth/register")
      .send({
        email: `dummy7@scottylabs.org`,
        password: "abc123",
      });
    expect(registerAttackerResponse.status).toEqual(200);
    const { token: attackerToken } = registerAttackerResponse.body;

    // Register user to reject
    const registerApplicantResponse = await request(app)
      .post("/auth/register")
      .send({
        email: `dummy8@scottylabs.org`,
        password: "abc123",
      });
    expect(registerApplicantResponse.status).toEqual(200);
    const { _id: userId } = registerApplicantResponse.body;

    // Update status so user appears to have completed their profile
    await User.findByIdAndUpdate(userId, { status: Status.COMPLETED_PROFILE });

    // Attempt rejecting user
    const admitResponse = await request(app)
      .post(`/users/${userId}/reject`)
      .set("x-access-token", attackerToken);
    expect(admitResponse.status).toEqual(403);

    // Check that status is not updated
    const user = await User.findById(userId);
    expect(user).not.toBeNull();
    expect(user.status).toBe(Status.COMPLETED_PROFILE);
  });
});
