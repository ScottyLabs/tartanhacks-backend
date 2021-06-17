import dotenv from "dotenv";
import express, { Express } from "express";
import MongoMemoryServer from "mongodb-memory-server-core";
import mongoose from "mongoose";
import router from "src/routes";
import { startup } from "src/util/startup";

/**
 * Initialize Express app
 */
export const getApp = (): Express => {
  const app = express();
  app.use(
    express.json({
      limit: "5mb",
    })
  );
  app.use(
    express.urlencoded({
      limit: "5mb",
      extended: true,
    })
  );
  app.use("/", router);
  return app;
};

/**
 * Instantiate and initialize the mock database
 */
export const setup = async (): Promise<void> => {
  // initialize environment
  dotenv.config();

  // initialize MongoDB debug database
  const mongod = new MongoMemoryServer();
  const uri = await mongod.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  (global as any).__DB__ = mongod;
  // run startup
  const result = await startup();
  if (!result) {
    throw new Error("Could not complete startup check successfully.");
  }
};

/**
 * Close the mongoose connection and shutdown the mock database
 */
export const shutdown = async (): Promise<void> => {
  await mongoose.disconnect();
  await (global as any).__DB__.stop();
};
