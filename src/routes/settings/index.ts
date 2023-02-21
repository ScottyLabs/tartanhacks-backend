import express, { Router } from "express";
import { asyncCatch } from "src/util/asyncCatch";
import { isAdmin } from "../middleware";
import get from "./get";
import put from "./put";

/**
 * @swagger
 * tags:
 *  name: Settings Module
 *  description: Endpoints for settings control. Access - Admin only
 */
const router: Router = express.Router();
router.get("/", isAdmin, asyncCatch(get));
router.put("/", isAdmin, asyncCatch(put));

export default router;
