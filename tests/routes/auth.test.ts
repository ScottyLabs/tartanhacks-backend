/**
 * Test suite for authentication routes
 */
import { Express } from "express";
import request from "supertest";
import { setup, getApp, shutdown } from "../index";

let app: Express = null;

beforeAll(async () => {
  await setup();
  app = getApp();
});

afterAll(async () => {
  await shutdown();
});

describe("auth", () => {
  // Registration should work normally
  describe("register", () => {
    it("should create a user", async () => {
      const response = await request(app).post("/auth/register").send({
        email: "dummy@scottylabs.org",
        password: "abc123",
      });
      expect(response.status).toEqual(200);
      expect(response.body).not.toBeNull();
      const user = response.body;
      expect(user.email).toEqual("dummy@scottylabs.org");
    });
  });

  // ensure that multiple registrations with the same email are not allowed
  describe("register duplicate", () => {
    it("should fail", async () => {
      await request(app).post("/auth/register").send({
        email: "dummy1@scottylabs.org",
        password: "abc123",
      });
      const response = await request(app).post("/auth/register").send({
        email: "dummy1@scottylabs.org",
        password: "def456",
      });
      expect(response.status).toEqual(400);
    });
  });

  describe("login", () => {
    it("should work via email password", async () => {
      const register = await request(app).post("/auth/register").send({
        email: "dummy2@scottylabs.org",
        password: "abc123",
      });
      const login = await request(app).post("/auth/login").send({
        email: "dummy2@scottylabs.org",
        password: "abc123",
      });
      expect(register.body._id).not.toBeNull();
      expect(login.body._id).toEqual(register.body._id);
    });

    it("should work via token", async () => {
      const register = await request(app).post("/auth/register").send({
        email: "dummy3@scottylabs.org",
        password: "abc123",
      });
      const token = register.body.token;
      const login = await request(app)
        .post("/auth/login")
        .set("x-access-token", token)
        .send();
      expect(login.body._id).toEqual(register.body._id);
    });
  });
});
