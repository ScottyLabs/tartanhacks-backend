import express from "express"
import { MongoMemoryServer } from 'mongodb-memory-server';

const PORT = 5000

const setup = async () => {
  console.log("Starting mongo server");
  const mongod = new MongoMemoryServer();
  const uri = await mongod.getUri();
  console.log("URI", uri);
}

const app = express()

app.get("/", (_, res) => {
  res.status(200).send()
})

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
  setup();
})
