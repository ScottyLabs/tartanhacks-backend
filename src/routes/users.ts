import express, { Router } from "express";
import { getUserProfile } from "../controllers/ProfileController";
import { getUserStatus } from "../controllers/StatusController";
import {
  admitUser,
  getUserById,
  getUsers,
  getUserTeam,
  rejectUser,
  admitAllUsers,
  rejectAllUsers,
} from "../controllers/UsersController";
import { getProjectByUserID } from "../controllers/ProjectsController";
import { asyncCatch } from "../util/asyncCatch";
import {
  isAdmin,
  isOwnerOrAdmin,
  isOwnerRecruiterOrAdmin,
  isRecruiterOrAdmin,
  isAuthenticated,
} from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Users Module
 *  description: Endpoints to manage users.
 */

/**
 * @swagger
 * /users:
 *  get:
 *    summary: Query list of users
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Users Module]
 *    description: Retrieves list of all users in the database. Access - Admin
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Forbidden.
 *      500:
 *        description: Internal Server Error.
 */
router.get("/", isAdmin, asyncCatch(getUsers));

/**
 * @swagger
 * /users/{id}:
 *  get:
 *    summary: Query user by user ID
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Users Module]
 *    description: Retrieves user info by user ID, Access - Admin or Owner
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Forbidden.
 *      500:
 *        description: Internal Server Error.
 */
router.get("/:id", isOwnerOrAdmin, asyncCatch(getUserById));

/**
 * @swagger
 * /users/{userId}/profile:
 *   get:
 *     summary: Get a user's application profile
 *     tags: [Users Module]
 *     description: Get a user's application profile. Access - Owner, Recruiter, or Admin only
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *     - in: path
 *       name: userId
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *           description: Success.
 *       400:
 *           description: Bad request
 *       403:
 *           description: Unauthorized.
 *       404:
 *           description: User does not exist.
 *       500:
 *           description: Internal Server Error.
 */
router.get("/:id/profile", isOwnerRecruiterOrAdmin, asyncCatch(getUserProfile));

/**
 * @swagger
 * /users/{userId}/status:
 *   get:
 *     summary: Get a user's status (application progress)
 *     tags: [Users Module]
 *     description: Get a user's status. Access - Owner or Admin only
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *     - in: path
 *       name: userId
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *           description: Success.
 *       400:
 *           description: Bad request
 *       403:
 *           description: Unauthorized.
 *       404:
 *           description: User does not exist.
 *       500:
 *           description: Internal Server Error.
 */
router.get("/:id/status", isOwnerOrAdmin, asyncCatch(getUserStatus));

/**
 * @swagger
 * /users/{id}/admit:
 *  post:
 *    summary: Admit user by ID
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Users Module]
 *    description: Admit user by ID, Access - Admin
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Forbidden.
 *      404:
 *        description: User not found.
 *      500:
 *        description: Internal Server Error.
 */
router.post("/:id/admit", isAdmin, asyncCatch(admitUser));

/**
 * @swagger
 * /users/{id}/reject:
 *  post:
 *    summary: Reject user by ID
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Users Module]
 *    description: Reject user by ID, Access - Admin
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Forbidden.
 *      404:
 *        description: User not found.
 *      500:
 *        description: Internal Server Error.
 */
router.post("/:id/reject", isAdmin, asyncCatch(rejectUser));

/**
 * @swagger
 * /users/{id}/team:
 *  get:
 *    summary: Get a user's team
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Users Module]
 *    description: Get a user's team, Access - Admin, Recruiter or Owner
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *        description: Success.
 *      400:
 *        description: User does not have a team
 *      403:
 *        description: Forbidden.
 *      404:
 *        description: User not found.
 *      500:
 *        description: Internal Server Error.
 */
router.get("/:id/team", isOwnerRecruiterOrAdmin, asyncCatch(getUserTeam));

/**
 * @swagger
 * /users/{id}/project:
 *   get:
 *     summary: Get a user's project
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Users Module]
 *     description: Get a single project by user ID. Access - User
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: user ID
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
router.get("/:id/project", isAuthenticated, asyncCatch(getProjectByUserID));

/**
 * @swagger
 * /users/admit/all:
 *  post:
 *    summary: Admit all users with completed profiles that have not been accepted/rejected yet
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Users Module]
 *    description: Admit users with completed profiles that have not been accepted/rejected yet, Access - Admin
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Forbidden.
 *      404:
 *        description: User not found.
 *      500:
 *        description: Internal Server Error.
 */
router.post("/admit/all", isAdmin, asyncCatch(admitAllUsers));

/**
 * @swagger
 * /users/reject/all:
 *  post:
 *    summary: Reject all users with completed profiles that have not been admitted/rejected yet
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Users Module]
 *    description: Reject users with completed profiles that have not been admitted/rejected yet, Access - Admin
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Forbidden.
 *      404:
 *        description: User not found.
 *      500:
 *        description: Internal Server Error.
 */
router.post("/reject/all", isAdmin, asyncCatch(rejectAllUsers));

export default router;
