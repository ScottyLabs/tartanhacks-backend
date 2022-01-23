import express, { Router } from "express";
import { getTeams, searchTeamByName } from "../controllers/TeamController";
import { getPresentingTeams } from "../controllers/ProjectsController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin, isAuthenticated } from "./middleware";

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

/**
 * @swagger
 * /teams/search:
 *   get:
 *     summary: Search for a team based on name
 *     tags: [Teams Module]
 *     description: Search for a team based on name. Access - User
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *     - in: query
 *       name: name
 *       required: true
 *       type: string
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
router.get("/search", isAuthenticated, asyncCatch(searchTeamByName));

/**
 * @swagger
 * /teams/presenting-live:
 *   get:
 *     summary: Get teams that will be presenting live
 *     tags: [Teams Module]
 *     description: Get list of teams that will be presenting their projects live. Access - Admin
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
router.get("/presenting-live", isAdmin, asyncCatch(getPresentingTeams));

export default router;
