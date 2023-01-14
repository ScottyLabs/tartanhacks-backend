import express, { Router } from "express";
import { makeJudges } from "src/controllers/UsersController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Judge Module
 *  description: Endpoints for judge management. Access - Admin only
 */

/**
 * @swagger
 * /judge:
 *   post:
 *     summary: Create many judges from a list of emails
 *     tags: [Judge Module]
 *     description: Make a list of users (emails) into judges. Access - Admin only
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       403:
 *          description: Unauthorized.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/", isAdmin, asyncCatch(makeJudges));

export default router;
