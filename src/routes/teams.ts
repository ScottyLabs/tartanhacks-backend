import express, { Router } from "express";
import { createTeam } from "../controllers/TeamController";
import { isAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Teams Module
 *  description: Endpoints for team management. Access - User
 */

/**
 * @swagger
 * /teams/new:
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
router.post("/new", isAdmin, createTeam);

export default router;
