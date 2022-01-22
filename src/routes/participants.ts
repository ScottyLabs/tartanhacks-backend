import express, { Router } from "express";
import { getParticipants } from "../controllers/UsersController";
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

export default router;
