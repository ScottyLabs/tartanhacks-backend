import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import router from "./routes";
import swaggerSpecification from "./swagger";
import { startup } from "./util/startup";
import cors from "cors";
import Team from "./models/Team";
import Profile from "./models/Profile";

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/tartanhacks";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
});
mongoose.set("useFindAndModify", false);

// Build indexes
// Team.ensureIndexes();
// Profile.ensureIndexes();

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
  console.log(`Running on port ${PORT}`);
});
