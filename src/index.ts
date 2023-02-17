import axios, { AxiosResponse } from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { writeFileSync } from "fs";
import mongoose from "mongoose";
import { ObjectId } from "bson";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import User from "./models/User";
import router from "./routes";
import { getResumeUrl } from "./services/storage";
import swaggerSpecification from "./swagger";
import { startup } from "./util/startup";
import { Status } from "./_enums/Status";

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/tartanhacks";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  autoIndex: true,
});
mongoose.set("useFindAndModify", false);

// Build indexes, avoid recreating every dev hot reload
// if (process.env.NODE_ENV !== "dev") {
//   Team.ensureIndexes();
//   Profile.ensureIndexes();
// }

const app = express();
app.use(cors());
app.use(morgan("dev"));
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

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecification, {
    swaggerOptions: { persistAuthorization: true },
  })
);

const server = app.listen(PORT, async () => {
  const result = await startup();
  if (!result) {
    console.error("Failed to complete startup successfully. Shutting down.");
    server.close();
    return;
  }

  // await downloadResumes();

  console.log(`Running on port ${PORT}`);
});

async function downloadResumes() {
  const users = await User.find({
    // status: Status.CONFIRMED,
    admin: false,
    company: null,
  });
  const ids = users.map((user) => user._id);
  const urls = [] as [ObjectId, string][];
  for (const [idx, id] of ids.entries()) {
    console.log(`Getting url ${idx + 1}/${ids.length}`);
    urls.push([id, await getResumeUrl(id)]);
  }

  const entries = [] as [ObjectId, AxiosResponse<any, any>][];
  for (const [idx, [id, url]] of urls.entries()) {
    try {
      console.log(`Downloading resume ${idx + 1}/${urls.length}`);
      entries.push([id, await axios.get(url, { responseType: "arraybuffer" })]);
    } catch (err) {
      console.log("Failure");
    }
  }

  entries.forEach(([id, response], idx) => {
    console.log("Writing resume", idx + 1, "/", entries.length);
    writeFileSync(`resumes/${id}.pdf`, response.data);
  });
}
