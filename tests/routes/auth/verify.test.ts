/**
 * Test suite for email verification
 */
 import { Express } from "express";
 import request from "supertest";
 import { setup, getApp, shutdown } from "../../index";
 import User from "src/models/User";
 import Status from "src/models/Status";
 import { ObjectId } from "bson";
 
 let app: Express = null;
 
 beforeAll(async () => {
   await setup();
   app = getApp();
 });
 
 afterAll(async () => {
   await shutdown();
 });

describe("verify", () => {
  // Standard verification should create a Status object, verifying the user
  it("should update a user's status", async () => {
    const registerResponse = await request(app).post("/auth/register").send({
      email: "dummy@scottylabs.org",
      password: "abc123",
    });
    const { _id } = registerResponse.body;
    const user = await User.findById(_id);
    const token = user.generateEmailVerificationToken();
    const verifyResponse = await request(app).get(`/auth/verify/${token}`).send();
    expect(verifyResponse.status).toEqual(200);

    const status = await Status.findOne({ user: new ObjectId(_id) });
    expect(status).not.toBeNull();
    expect(status.verified).toBe(true);
  });

  // Verification should not occur for invalid tokens
  it("should error 400 for bad token", async () => {
    const registerResponse = await request(app).post("/auth/register").send({
      email: "dummy1@scottylabs.org",
      password: "abc123",
    });
    const { _id } = registerResponse.body;
    const verifyResponse = await request(app).get(`/auth/verify/abc`).send();
    expect(verifyResponse.status).toEqual(400);

    const status = await Status.findOne({ user: new ObjectId(_id) });
    expect(status).toBeNull();
  })
});