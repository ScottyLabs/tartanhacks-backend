import express, { Router } from "express";
import { isAdmin } from "./middleware";
import { asyncCatch } from "../util/asyncCatch";
import { getAnalytics } from "../controllers/AnalyticsController";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Analytics Module
 *  description: Endpoints for user analytics. Access - Admin only
 */

/**
 * @swagger
 * /analytics/:
 *   get:
 *     summary: Get Analytics
 *     tags: [Analytics Module]
 *     description: Compute and get analytics. Access - Admin only.
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       403:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/", isAdmin, asyncCatch(getAnalytics));

export default router;
