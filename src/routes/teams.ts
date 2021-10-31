import express, { Router } from "express";
import { getTeams } from "../controllers/TeamController";
import { asyncCatch } from "../util/asyncCatch";
import { isAuthenticated } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Teams Module
 *  description: Endpoints for team management. Access - User
 */

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: List all existing teams
 *     tags: [Teams Module]
 *     description: List all existing teams. Access - User
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
router.get("/", isAuthenticated, asyncCatch(getTeams));

export default router;
