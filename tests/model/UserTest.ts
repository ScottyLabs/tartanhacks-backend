import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import assert from "assert"
import User from "../../src/models/User"
import { IUser } from "../../src/_types/User"

describe("User", () => {
  describe("User creation", () => {
    it("should save", async () => {
      const user: IUser = new User({
        email: "tartanhacks@scottylabs.org",
        password: "abc123",
        admin: false,
      })
      await user.save()
    })
  })
})
