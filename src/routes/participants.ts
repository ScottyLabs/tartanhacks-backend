import express, { Router } from "express";
import {
  getParticipants,
  getVerifiedUserEmails,
} from "../controllers/UsersController";
import { asyncCatch } from "../util/asyncCatch";
import { isRecruiterOrAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Participants Module
 *  description: Endpoints to manage participant users.
 */

/**
 * @swagger
 * /participants:
 *  get:
 *    summary: Search for participants or return the list of all participants
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Participants Module]
 *    description: Retrieves list of participants in the database. Access - Recruiter or Admin
 *    parameters:
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *        description: The name of a participant to search for.
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Forbidden.
 *      500:
 *        description: Internal Server Error.
 */
router.get("/", isRecruiterOrAdmin, asyncCatch(getParticipants));

/**
 * @swagger
 * /participants/no-submission:
 *  get:
 *    summary: Get emails of verified participants that have not yet submitted their applications
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Participants Module]
 *    description: Retrieves list of participants who are verified but have not yet submitted their applications. Access - Recruiter or Admin
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Forbidden.
 *      500:
 *        description: Internal Server Error.
 */
router.get(
  "/no-submission",
  isRecruiterOrAdmin,
  asyncCatch(getVerifiedUserEmails)
);

export default router;
