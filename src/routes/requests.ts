import express, { Router } from "express";
import {
  acceptTeamRequest,
  getTeamRequests,
  getUserRequests,
} from "../controllers/TeamRequestController";
import { asyncCatch } from "../util/asyncCatch";
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
 * /requests/team/{teamId}:
 *   get:
 *     summary: View incoming and outgoing requests for a team
 *     tags: [Team Requests Module]
 *     description: View incoming and outgoing requests for a team. Access - User
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *     - in: path
 *       name: teamId
 *       required: true
 *       type: string
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
router.get("/team/:teamId", isAuthenticated, asyncCatch(getTeamRequests));

/**
 * @swagger
 * /requests/user/{userId}:
 *   get:
 *     summary: View incoming and outgoing requests for a user
 *     tags: [Team Requests Module]
 *     description: View incoming and outgoing requests for a user. Access - User
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *     - in: path
 *       name: userId
 *       required: true
 *       type: string
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
router.get("/user/:teamId", isAuthenticated, asyncCatch(getUserRequests));

/**
 * @swagger
 * /requests/accept/{requestId}:
 *   post:
 *     summary: Accept a team request
 *     tags: [Team Requests Module]
 *     description: |
 *       Accept a team request.
 *       If INVITE request, can only be accessed by team admin.
 *       If JOIN request, can only be accessed by owner. Access - User
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *     - in: path
 *       name: requestId
 *       required: true
 *       type: string
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
router.post(
  "/accept/:requestId",
  isAuthenticated,
  asyncCatch(acceptTeamRequest)
);

export default router;
