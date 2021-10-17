import express, { Router } from "express";
import {
  createTeam,
  getTeam,
  inviteUser,
  kickUser,
  leaveTeam,
  promoteUser,
  updateTeam,
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

/**
 * @swagger
 * /team/:
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
 *               description:
 *                 type: string
 *               visible:
 *                 type: boolean
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
 * /team/:
 *   patch:
 *     summary: Update a team's information
 *     tags: [Teams Module]
 *     description: Update a team's name, description, or visibility. Access - User, Team Admin
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
 *               description:
 *                 type: string
 *               visible:
 *                 type: boolean
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
router.patch("/", isAuthenticated, asyncCatch(updateTeam));

/**
 * @swagger
 * /team/invite/{userId}:
 *   post:
 *     summary: Invite a user to a team
 *     tags: [Teams Module]
 *     description: Invite a user to a team. Access - User, Team Admin
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
router.post("/invite/:id", isAuthenticated, asyncCatch(inviteUser));

/**
 * @swagger
 * /team/kick/{userId}:
 *   post:
 *     summary: Kick a user from your team
 *     tags: [Teams Module]
 *     description: Kick a user from your team. Access - User, Team Admin
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
router.post("/kick/:id", isAuthenticated, asyncCatch(kickUser));

/**
 * @swagger
 * /team/promote/{userId}:
 *   post:
 *     summary: Promote another member of your team into the admin
 *     tags: [Teams Module]
 *     description: Promote another member of your team into the admin. This will remove your admin status. Access - User, Team Admin
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
router.post("/promote/:id", isAuthenticated, asyncCatch(promoteUser));

/**
 * @swagger
 * /team/leave:
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
router.post("/leave", isAuthenticated, asyncCatch(leaveTeam));

export default router;
