import express from "express";
import authRouter from "./auth";
import adminRouter from "./admin";
import userRouter from "./user";
import usersRouter from "./users";
import scheduleRouter from "./schedule";
import checkInRouter from "./checkin";

const router = express.Router();
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/user", userRouter);
router.use("/users", usersRouter);
router.use("/schedule", scheduleRouter);
router.use("/check-in", checkInRouter);
export default router;
