import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import router from "./routes";
import { startup } from "./util/startup";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/tartanhacks";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
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

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "TartanHacks Backend",
      version: "0.0.1",
    },
    basePath: '/',
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-access-token'
        }
      }
    }
  },
  apis: ["**/*.ts"],
};
const swaggerSpecification = swaggerJsDoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecification));

const server = app.listen(PORT, async () => {
  const result = await startup();
  if (!result) {
    console.error("Failed to complete startup successfully. Shutting down.");
    server.close();
    return;
  }
  console.log(`Running on port ${PORT}`);
});
