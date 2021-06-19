import express, { Router } from "express";
import { createAdmin } from "../controllers/AdminController";
import { isAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Admin Module
 *  description: Endpoints for admin control. Access - Admin only
 */

/**
 * @swagger
 * /admin/new/{id}:
 *   post:
 *     summary: Make a user an admin
 *     tags: [Admin Module]
 *     description: Make a user into an admin. Access - Admin only
 *     security:
 *       - UserTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to make into an admin
 *     responses:
 *       200:
 *          description: Success.
 *       404:
 *          description: User does not exist.
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/new/:id", isAdmin, createAdmin);

export default router;
