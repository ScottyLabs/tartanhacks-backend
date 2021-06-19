import express, { Router, Request, request } from "express";
import { getUsers, getUserById } from "src/controllers/UsersController";
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
 *    tags: [Users Module]
 *    description: Retrieves list of all users in the database. Access - Admin
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                admin:
 *                  type: boolean
 *                name:
 *                  type: string
 *                sponsor:
 *                  type: string
 *    responses:
 *      200:
 *        description: Success.
 *      401:
 *        description: Unauthorized.
 *      500:
 *        description: Internal Server Error.
 */
router.get("/", isAdmin, getUsers);

router.get("/:id", isOwnerOrAdmin, getUserById);

export default router;