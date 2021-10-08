/**
 * Test suite for registration
 */
import { Express } from "express";
import request from "supertest";
import { setup, getApp, shutdown } from "../../index";

let app: Express = null;

beforeAll(async () => {
  await setup();
  app = getApp();
});

afterAll(async () => {
  await shutdown();
});

describe("register", () => {
  // Registration should work normally
  it("should create a user", async () => {
    const registerResponse = await request(app).post("/auth/register").send({
      email: "dummy@scottylabs.org",
      password: "abc123",
    });
    expect(registerResponse.status).toEqual(200);
    expect(registerResponse.body).not.toBeNull();
    const user = registerResponse.body;
    expect(user.email).toEqual("dummy@scottylabs.org");
  });

  // ensure that multiple registrations with the same email are not allowed
  it("should fail for duplicates", async () => {
    await request(app).post("/auth/register").send({
      email: "dummy1@scottylabs.org",
      password: "abc123",
    });
    const registerResponse = await request(app).post("/auth/register").send({
      email: "dummy1@scottylabs.org",
      password: "def456",
    });
    expect(registerResponse.status).toEqual(400);
  });
});
