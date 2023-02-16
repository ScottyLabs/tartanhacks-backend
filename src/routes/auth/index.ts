import express, { Router } from "express";
import { asyncCatch } from "src/util/asyncCatch";
import { register } from "./register";

/**
 * @swagger
 * tags:
 *  name: Authentication Module
 *  description: Endpoints to manage user authentication.
 */
const router: Router = express.Router();
router.post("/register", asyncCatch(register));

export default router;
