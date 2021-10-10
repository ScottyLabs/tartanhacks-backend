import express, { Router } from "express";
import {
  getTeam,
} from "../controllers/TeamController";
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
 * /team/{teamId}:
 *   get:
 *     summary: Get information about a specific team
 *     tags: [Teams Module]
 *     description: Get information about a specific team. Access - User
 *     parameters:
 *     - in: path
 *       name: teamId
 *       required: true
 *       type: string
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
router.get("/:id", isAuthenticated, asyncCatch(getTeam));

export default router;
