/**
 * End-to-end test encompassing standard user flows
 */
import { Express } from "express";
import User from "src/models/User";
import { Status } from "src/_enums/Status";
import { IUser } from "src/_types/User";
import Prize from "src/models/Prize";
import { getTartanHacks } from "src/controllers/EventController";
import request from "supertest";
import { getApp, setup, shutdown } from "../index";

let app: Express = null;

beforeAll(async () => {
  await setup();
  app = getApp();
});

afterAll(async () => {
  await shutdown();
});

const TEST_PROFILE = {
  firstName: "Cynthia",
  lastName: "Diamond",
  displayName: "garchomp",
  age: 20,
  school: "Carnegie Mellon University",
  graduationYear: 2024,
  gender: "Female",
  ethnicity: "Asian",
  phoneNumber: "1234567890",
  github: "garchomp",
};

const TEST_CONFIRMATION = {
  signatureLiability: true,
  signatureCodeOfConduct: true,
  willMentor: false,
};

describe("Minimal e2e user flow", () => {
  let admin: IUser;
  let adminToken: string;
  let testPrizeId: string;

  jest.setTimeout(30_000);

  // Create admin account
  beforeAll(async () => {
    admin = new User({
      email: "dummy+admin@scottylabs.org",
      password: "abc123",
      admin: true,
    });
    await admin.save();

    adminToken = await admin.generateAuthToken();
    const event = await getTartanHacks();

    const testPrize = new Prize({
      event: event._id,
      name: "Test Prize",
      description: "Test Prize",
    });
    await testPrize.save();
    testPrizeId = testPrize._id.toString();
  });

  // Register and admit user, mocking email verification
  it("should register and admit user", async () => {
    // Register participant
    const participantEmail = "dummy@scottylabs.org";
    const registerResponse = await request(app).post("/auth/register").send({
      email: participantEmail,
      password: "abc123",
    });
    expect(registerResponse?.status).toEqual(200);
    expect(registerResponse?.body).not.toBeNull();

    const {
      _id: participantId,
      email,
      password,
      token: participantToken,
    } = registerResponse.body;
    expect(email).toStrictEqual(participantEmail); // Ensure response matches inputs
    expect(password).toBeUndefined(); // Ensure password is not being sent back

    const participantUser = await User.findById(participantId);
    expect(participantUser).not.toBeNull(); // User should exist
    expect(participantUser.status).toStrictEqual(Status.UNVERIFIED); // Should not yet be verified

    // Manually get verification token, since we can't test the email
    const verificationToken =
      await participantUser.generateEmailVerificationToken();
    expect(verificationToken).not.toBeNull();

    // Verify user
    const verificationResponse = await request(app)
      .get(`/auth/verify/${verificationToken}`)
      .send();
    expect(verificationResponse?.status).toEqual(200);

    // Submit resume
    const resumeBuffer = Buffer.from("resume");
    const submitResumeResponse = await request(app)
      .post("/user/resume")
      .set("x-access-token", participantToken)
      .attach("file", resumeBuffer, "resume.pdf");
    expect(submitResumeResponse?.status).toEqual(200);

    // Complete profile
    const submitProfileResponse = await request(app)
      .put("/user/profile")
      .set("x-access-token", participantToken)
      .send(TEST_PROFILE);
    expect(submitProfileResponse?.status).toEqual(200);

    // Admit user
    const admitResponse = await request(app)
      .post(`/users/${participantId}/admit`)
      .set("x-access-token", adminToken)
      .send();
    expect(admitResponse?.status).toEqual(200);

    // Confirm acceptance
    const confirmResponse = await request(app)
      .put("/user/confirmation")
      .set("x-access-token", participantToken)
      .send(TEST_CONFIRMATION);
    expect(confirmResponse?.status).toEqual(200);

    // Create team
    const teamCreateResponse = await request(app)
      .post("/team")
      .set("x-access-token", participantToken)
      .send({
        name: "dummyTeam",
      });
    expect(teamCreateResponse?.status).toEqual(200);
    expect(teamCreateResponse?.body).not.toBeNull();
    const { _id: teamId } = teamCreateResponse.body;

    // Submit project
    const projectSubmitResponse = await request(app)
      .post("/projects")
      .set("x-access-token", participantToken)
      .send({
        name: "dummyProject",
        description: "Dummy project",
        team: teamId,
        presentingVirtually: false,
        url: "https://tartanhacks.com",
      });
    expect(projectSubmitResponse?.status).toEqual(200);
    expect(projectSubmitResponse?.body).not.toBeNull();
    const { _id: projectId } = projectSubmitResponse.body;

    // Submit for prize
    const addPrizeResponse = await request(app)
      .put(`/projects/prizes/enter/${projectId}`)
      .set("x-access-token", participantToken)
      .query({ prizeID: testPrizeId })
      .send();
    expect(addPrizeResponse?.status).toEqual(200);

    // Get all projects
    const getProjectsResponse = await request(app)
      .get("/projects")
      .set("x-access-token", adminToken)
      .send();
    expect(getProjectsResponse?.status).toEqual(200);
    expect(getProjectsResponse?.body).not.toBeNull();

    // Ensure project is submitted
    const projects = getProjectsResponse.body;
    expect(projects.length).toEqual(1);

    // Ensure submitted project matches
    const [project] = projects;
    expect(project).not.toBeNull();
    expect(project._id).toStrictEqual(projectId);
    expect(project.name).toStrictEqual("dummyProject");
    expect(project.prizes?.length).toStrictEqual(2); // Grand prize and test prize

    // Ensure associated team matches submitting team
    expect(project.team).not.toBeNull();
    expect(project.team._id).toStrictEqual(teamId);
    expect(project.team.members.length).toStrictEqual(1);
    const [member] = project.team.members;
    expect(member._id).toStrictEqual(participantId);
  });
});
