import express, { Router } from "express";
import {
  getLeaderBoard, getLeaderBoardPosition
} from "../controllers/CheckInController";
import { asyncCatch } from "../util/asyncCatch";
import { isAuthenticated } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Leaderboard Module
 *  description: Endpoints to manage and interact with the leaderboard
 */

/**
 * @swagger
 * /leaderboard:
 *   get:
 *     summary: Get the leaderboard
 *     tags: [Leaderboard Module]
 *     description: Get the leader board. Access - Public.
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
router.get("/", asyncCatch(getLeaderBoard));

/**
 * @swagger
 * /leaderboard/position:
 *   get:
 *     summary: Get the current user's position on the leaderboard
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Leaderboard Module]
 *     description: Get the current user's position on the leaderboard. Access - User.
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
router.get("/position", isAuthenticated, asyncCatch(getLeaderBoardPosition));

export default router;
