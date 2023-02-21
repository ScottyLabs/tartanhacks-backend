import express, { Router } from "express";
import { asyncCatch } from "src/util/asyncCatch";
import { isAdmin } from "../middleware";
import { getSettings } from "./getSettings";
import { updateSettings } from "./updateSettings";

/**
 * @swagger
 * tags:
 *  name: Settings Module
 *  description: Endpoints for settings control. Access - Admin only
 */
const router: Router = express.Router();
router.get("/", isAdmin, asyncCatch(getSettings));
router.put("/", isAdmin, asyncCatch(updateSettings));

export default router;
