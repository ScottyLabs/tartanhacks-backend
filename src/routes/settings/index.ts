import express, { Router } from "express";
import { asyncCatch } from "src/util/asyncCatch";
import { getSettings } from "./getSettings";

/**
 * @swagger
 * tags:
 *  name: Settings Module
 *  description: Endpoints for settings control. Access - Admin only
 */
const router: Router = express.Router();
router.get("/", asyncCatch(getSettings));

export default router;
