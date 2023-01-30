import express, { Router } from "express";
import { getResume, getUserProfile } from "../controllers/ProfileController";
import { getProjectByUserID } from "../controllers/ProjectsController";
import {
  admitAllCMU,
  admitAllUsers,
  admitUser,
  getConfirmedUserEmails,
  getUserById,
  getUsers,
  getUserTeam,
  rejectAllUsers,
  rejectUser,
  waitlistPendingUsers,
} from "../controllers/UsersController";
import { asyncCatch } from "../util/asyncCatch";
import {
  isAdmin,
  isAuthenticated,
  isOwnerOrAdmin,
  isOwnerRecruiterOrAdmin,
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
 * /users/{id}/resume:
 *  get:
 *    summary: Get a user's resume
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Users Module]
 *    description: Get a user's resume. Must have an associated profile. Access - User
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      type: string
 *    responses:
 *      302:
 *        description: Redirect.
 *      400:
 *        description: Bad request
 *      403:
 *        description: Unauthorized.
 *      500:
 *        description: Internal Server Error.
 */
router.get("/:id/resume", asyncCatch(getResume));

/**
 * @swagger
 * /users/{id}/profile:
 *   get:
 *     summary: Get a user's application profile
 *     tags: [Users Module]
 *     description: Get a user's application profile. Access - Owner, Recruiter, or Admin only
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *     - in: path
 *       name: id
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
 * /users/admit/cmu:
 *  post:
 *    summary: Admit all users from CMU with completed profiles that have not been accepted/rejected yet
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Users Module]
 *    description: Admit users from CMU with completed profiles that have not been accepted/rejected yet, Access - Admin
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
router.post("/admit/cmu", isAdmin, asyncCatch(admitAllCMU));

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

/**
 * @swagger
 * /users/waitlist:
 *  post:
 *    summary: Waitlist users
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
router.post("/waitlist", isAdmin, asyncCatch(waitlistPendingUsers));

export default router;
