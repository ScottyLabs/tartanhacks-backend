import express from "express";
import authRouter from "./auth";
import adminRouter from "./admin";
import usersRouter from "./users";
import scheduleRouter from "./schedule";

const router = express.Router();
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/users", usersRouter);
router.use("/schedule", scheduleRouter);

export default router;
