import express, { Router } from "express";
import { getUserById, getUsers } from "../controllers/UsersController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin, isOwnerOrAdmin } from "./middleware";

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
 *      401:
 *        description: Unauthorized.
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
 *      401:
 *        description: Unauthorized.
 *      403:
 *        description: Forbidden.
 *      500:
 *        description: Internal Server Error.
 */
router.get("/:id", isOwnerOrAdmin, asyncCatch(getUserById));

export default router;
