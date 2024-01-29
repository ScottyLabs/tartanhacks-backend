import express, { Router } from "express";
import {
  createTeam,
  getOwnTeam,
  getTeam,
  inviteUser,
  inviteUserByEmail,
  joinTeam,
  kickUser,
  leaveTeam,
  promoteUser,
  updateTeam,
  updateTeamAdmin,
} from "../controllers/TeamController";
import { getProjectByTeamID } from "../controllers/ProjectsController";
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
 *       403:
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
 *       403:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/", isAuthenticated, asyncCatch(createTeam));

/**
 * @swagger
 * /team/:
 *   patch:
 *     summary: Update the user's team's information
 *     tags: [Teams Module]
 *     description: Update a team's name, description, or visibility. All specified fields will be updated. Access - User, Team Admin
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
 *       403:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.patch("/", isAuthenticated, asyncCatch(updateTeam));

/**
 * @swagger
 * /team/update-admin:
 *   patch:
 *     summary: Update a team's information
 *     tags: [Teams Module]
 *     description: Update the name, description, or visibility of an arbitrary team. All specified fields will be updated. Access - Admin
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
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
 *       403:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.patch("/update-admin", isAdmin, asyncCatch(updateTeamAdmin));

/**
 * @swagger
 * /team/join/{teamId}:
 *   post:
 *     summary: Send a request to join a team
 *     tags: [Teams Module]
 *     description: Send a request to join a team. Access - User
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *     - in: path
 *       name: teamId
 *       required: true
 *       type: string
 *       description: The id of the team to join
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
router.post("/join/:id", isAuthenticated, asyncCatch(joinTeam));

/**
 * @swagger
 * /team/invite/{userId}:
 *   post:
 *     summary: Invite a user to a team by their ID
 *     tags: [Teams Module]
 *     description: Invite a user to a team by their ID. Access - User, Team Admin
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
 *       403:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/invite/:id", isAuthenticated, asyncCatch(inviteUser));

/**
 * @swagger
 * /team/invite:
 *   post:
 *     summary: Invite a user to a team by their email address
 *     tags: [Teams Module]
 *     description: Invite a user to a team by their email address. Access - User, Team Admin
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
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
router.post("/invite", isAuthenticated, asyncCatch(inviteUserByEmail));

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
 *       403:
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
 *       403:
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
 *       403:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/leave", isAuthenticated, asyncCatch(leaveTeam));

/**
 * @swagger
 * /team/{id}/project:
 *   get:
 *     summary: Get Project by team ID
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Teams Module]
 *     description: Get a single project by team ID. Access - User
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Team ID
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
router.get("/:id/project", isAuthenticated, asyncCatch(getProjectByTeamID));

export default router;
