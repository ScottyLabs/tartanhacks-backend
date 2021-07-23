import express, { Router } from "express";
import { createNewProject } from "../controllers/ProjectsController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Projects Module
 *  description: Endpoints to manage dynamic projects.
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create new project
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Creates new project. Access - Admin.
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
 *               team:
 *                 type: string
 *               slides:
 *                 type: string
 *               video:
 *                 type: string
 *               url:
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
router.post("/", isAdmin, asyncCatch(createNewProject));

export default router;
