import express, { Router } from "express";
import {
  createTeam,
  getTeams,
  inviteUser,
  leaveTeam,
} from "../controllers/TeamController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin, isAuthenticated } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Team Module
 *  description: Endpoints for single team management. Access - User
 */

/**
 * @swagger
 * /teams:
 *   get:
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

/**
 * @swagger
 * /teams/:
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
 * /teams/invite/{userId}:
 *   post:
 *     summary: Invite a user to a team
 *     tags: [Teams Module]
 *     description: Invite a user to a team. Access - User
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *     - in: path
 *       name: userId
 *       required: true
 *       type: string
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
router.post("/invite/:userId", isAdmin, asyncCatch(inviteUser));

/**
 * @swagger
 * /teams/leave:
 *   post:
 *     summary: Leave your current team
 *     tags: [Teams Module]
 *     description: Leave your current team. Access - User
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
router.post("/leave", isAdmin, asyncCatch(leaveTeam));

export default router;
