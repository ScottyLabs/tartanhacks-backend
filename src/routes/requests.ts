import express, { Router } from "express";
import {
  getTeamRequests,
  getUserRequests,
} from "../controllers/TeamController";
import { isAuthenticated } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Team Requests Module
 *  description: Endpoints for team request management. Access - User
 */

/**
 * @swagger
 * /requests/team/:teamid:
 *   post:
 *     summary: View incoming and outgoing requests for a team
 *     tags: [Team Requests Module]
 *     description: View incoming and outgoing requests for a team. Access - User
 *     security:
 *       - apiKeyAuth: []
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
router.post("/team/:teamid", isAuthenticated, getTeamRequests);

/**
 * @swagger
 * /requests/user/:userid:
 *   post:
 *     summary: View incoming and outgoing requests for a user
 *     tags: [Team Requests Module]
 *     description: View incoming and outgoing requests for a user. Access - User
 *     security:
 *       - apiKeyAuth: []
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
router.post("/user/:teamid", isAuthenticated, getUserRequests);

export default router;
