import express, { Router } from "express";
import { asyncCatch } from "src/util/asyncCatch";
import login from "./login";
import register from "./register";
import verify from "./verify";

/**
 * @swagger
 * tags:
 *  name: Authentication Module
 *  description: Endpoints to manage user authentication.
 */
const router: Router = express.Router();
router.post("/register", asyncCatch(register));
router.post("/login", asyncCatch(login));
router.get("/verify/:token", asyncCatch(verify));

export default router;
