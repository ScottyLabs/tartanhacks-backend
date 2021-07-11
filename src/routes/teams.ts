import express, { Router } from "express";
import { createTeam, getTeams } from "../controllers/TeamController";
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
 *   post:
 *     summary: Create and join a team
 *     tags: [Teams Module]
 *     description: Create and join a team. Access - User
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/", isAuthenticated, asyncCatch(createTeam));

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: List all existing teams
 *     tags: [Teams Module]
 *     description: List all existing teams. Access - Admin
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/", isAdmin, asyncCatch(getTeams));

export default router;
