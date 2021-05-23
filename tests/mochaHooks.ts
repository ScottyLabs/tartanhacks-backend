import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"

const mongod = new MongoMemoryServer()

export const mochaHooks = {
  async beforeAll () {
    const uri = await mongod.getUri()
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    })
  }
}