import express from "express";
import authRouter from "./auth";
import adminRouter from "./admin";
import userRouter from "./user";
import usersRouter from "./users";

const router = express.Router();
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/user", userRouter);
router.use("/users", usersRouter);

export default router;
