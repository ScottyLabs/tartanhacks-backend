import express, { Router } from "express";
import { getJudges, makeJudges } from "../controllers/JudgeController";
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
 * /judges:
 *   get:
 *     summary: Get all judges
 *     tags: [Judge Module]
 *     description: Get all judges. Access - Admin only
 *     security:
 *       - apiKeyAuth: []
 *     responses:
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
router.get("/", isAdmin, asyncCatch(getJudges));

/**
 * @swagger
 * /judges:
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
 *     responses:
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
