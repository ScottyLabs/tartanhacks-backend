/**
 * Test suite for login
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

describe("login", () => {
  // Standard login with just email and password should pass
  it("should work via email password", async () => {
    const registerResponse = await request(app).post("/auth/register").send({
      email: "dummy2@scottylabs.org",
      password: "abc123",
    });
    const loginResponse = await request(app).post("/auth/login").send({
      email: "dummy2@scottylabs.org",
      password: "abc123",
    });
    expect(registerResponse.body._id).not.toBeNull();
    expect(loginResponse.body._id).toEqual(registerResponse.body._id);
  });

  // Login should fail with invalid credentials should fail with 400
  it("should work via email password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "dummy2@scottylabs.org",
      password: "abc124",
    });
    expect(response.status).toEqual(400);
  });

  // Login with just an access token should pass
  it("should work via token", async () => {
    const registerResponse = await request(app).post("/auth/register").send({
      email: "dummy3@scottylabs.org",
      password: "abc123",
    });
    const token = registerResponse.body.token;
    const login = await request(app)
      .post("/auth/login")
      .set("x-access-token", token)
      .send();
    expect(login.body._id).toEqual(registerResponse.body._id);
  });

  // Login with invalid access tokens should fail with 400
  it("should work via token", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .set("x-access-token", "abc")
      .send();
    expect(loginResponse.status).toEqual(400);
  });

  // Login should succeed with invalid body if the access token is correct
  it("should prioritize token over body", async () => {
    const registerResponse = await request(app).post("/auth/register").send({
      email: "dummy4@scottylabs.org",
      password: "abc123",
    });
    const token = registerResponse.body.token;
    const login = await request(app)
      .post("/auth/login")
      .set("x-access-token", token)
      .send({
        email: "dummy4@scottylabs.org",
        password: "abc124"
      });
    expect(login.body._id).toEqual(registerResponse.body._id);
  });

});