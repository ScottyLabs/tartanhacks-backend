import express, { Router } from "express";
import { createAdmin, removeAdmin } from "../controllers/AdminController";
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
 *       - apiKeyAuth: []
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
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/new/:id", isAdmin, createAdmin);
/**
 * @swagger
 * tags:
 *  name: Admin Module
 *  description: Endpoints for admin control. Access - Admin only
 */

/**
 * @swagger
 * /admin/remove/{id}:
 *   post:
 *     summary: Demote an admin
 *     tags: [Admin Module]
 *     description: Demote an existing admin. Access - Admin only
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the admin user to demote
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/remove/:id", isAdmin, removeAdmin);

export default router;
