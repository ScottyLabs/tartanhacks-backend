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
 
 describe("removal", () => {
   it("should remove a user's admin status", async () => {
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
 
     // Create user to demote
     const userRegisterResponse = await request(app).post("/auth/register").send({
       email: "dummy1@scottylabs.org",
       password: "abc123",
     });
     expect(userRegisterResponse.status).toEqual(200);
     const { _id: userId, token: userToken } = userRegisterResponse.body;
     const demoteAdminUser = await User.findById(userId);
     demoteAdminUser.admin = true;
     await demoteAdminUser.save();
     const demoteAdminToken = demoteAdminUser.generateAuthToken();
 
     //  Demote user
     const demoteResponse = await request(app)
       .post(`/admin/remove/${userId}`)
       .set("x-access-token", adminToken)
       .send();
     expect(demoteResponse.status).toEqual(200);
 
     //  Login user to get details
     const loginResponse = await request(app)
       .post("/auth/login")
       .set("x-access-token", userToken)
       .send();
     expect(loginResponse.status).toEqual(200);
 
     // Promoted user should now be an admin
     const user = loginResponse.body;
     expect(user).not.toBeNull();
     expect(user.admin).toEqual(false);
   });

   it("should fail for non-admin calls", async () => {
     //  Create user to use as admin
     const adminRegisterResponse = await request(app)
       .post("/auth/register")
       .send({
         email: "dummy2@scottylabs.org",
         password: "abc123",
       });
     expect(adminRegisterResponse.status).toEqual(200);
     const { _id: adminId } = adminRegisterResponse.body;
     const adminUser = await User.findById(adminId);
     adminUser.admin = true;
     await adminUser.save();
     const adminToken = adminUser.generateAuthToken();
 
     // Create user to attempt calling the demote from
     const userRegisterResponse = await request(app).post("/auth/register").send({
       email: "dummy3@scottylabs.org",
       password: "abc123",
     });
     expect(userRegisterResponse.status).toEqual(200);
     const { token: userToken } = userRegisterResponse.body;
 
     //  Attempt to demote the admin
     const demoteResponse = await request(app)
       .post(`/admin/remove/${adminId}`)
       .set("x-access-token", userToken)
       .send();
     expect(demoteResponse.status).toEqual(401);
 
     //  Login to admin user admin to get details
     const loginResponse = await request(app)
       .post("/auth/login")
       .set("x-access-token", adminToken)
       .send();
     expect(loginResponse.status).toEqual(200);
 
     // Original admin user status should not change
     const adminUserCheck = loginResponse.body;
     expect(adminUserCheck).not.toBeNull();
     expect(adminUserCheck.admin).toEqual(true);
   });
 });
 