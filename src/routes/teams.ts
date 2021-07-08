import express, { Router } from "express";
import { addNewTeam } from "../controllers/TeamsController";
import { isAuthenticated } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Teams Module
 *  description: Endpoints to manage team information.
 */

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create new Team
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Teams Module]
 *     description: Creates new team. Access - Authenticated Users.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               open:
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
router.post("/", isAuthenticated, addNewTeam);

export default router;
