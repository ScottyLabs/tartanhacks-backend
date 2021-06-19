import express from "express";
import authRouter from "./auth";
import adminRouter from "./admin";
import usersRouter from "./users";

const router = express.Router();
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/users", usersRouter);

export default router;
