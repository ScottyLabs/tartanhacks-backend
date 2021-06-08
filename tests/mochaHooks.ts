/**
 * Hooks that are run by Mocha before starting the test suite
 */
import chai from "chai";
import chaiHttp from "chai-http";
import dotenv from "dotenv";
import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import router from "../src/routes";
import { init } from "../src/util/startup";

// initialize environment
dotenv.config();

// initialize MongoDB debug db
const mongod = new MongoMemoryServer();

// initialize chai for http testing
chai.use(chaiHttp);

export const app = express();
app.use(
  express.json({
    limit: "5mb",
  })
);
app.use(
  express.urlencoded({
    limit: "5mb",
  })
);
app.use("/", router);
// run startup
init();

/**
 * Instantiate the mongo memory server before beginning tests
 */
export const mochaHooks = {
  async beforeAll(): Promise<void> {
    const uri = await mongod.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });
  },
};
