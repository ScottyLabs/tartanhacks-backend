import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { ZodError } from "zod";
import APIError from "./errors/APIError";
import ServerError from "./errors/ServerError";
import router from "./routes";
import swaggerSpecification from "./swagger";
import { startup } from "./util/startup";

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

const prisma = new PrismaClient();

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

// Initialize context
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.prisma = prisma;
  next();
});

app.use("/", router);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecification, {
    swaggerOptions: { persistAuthorization: true },
  })
);

// Set error handler
app.use(
  (
    err: APIError | ZodError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof ZodError) {
      // Argument type validation
      res.status(400).json({
        errors: err.issues,
        message: err.message,
      });
    } else if (err instanceof APIError) {
      // Route logic validation
      if (err instanceof ServerError) {
        console.error(err.message);
      }
      res.status(err.statusCode).json({
        message: err.message,
      });
    }
    next();
  }
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
