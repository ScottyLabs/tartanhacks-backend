/**
 * Hooks that are run by Mocha before starting the test suite
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongod = new MongoMemoryServer();

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
