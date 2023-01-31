import express, { Router } from "express";
import {
  getAdmittedUserEmails,
  getAppliedUserEmails,
  getConfirmedUserEmails,
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
 * /participants/verified:
 *  get:
 *    summary: Get emails of verified participants that have not yet submitted their applications
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Participants Module]
 *    description: Retrieves list of emails of participants who are verified but have not yet submitted their applications. Access - Recruiter or Admin
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Forbidden.
 *      500:
 *        description: Internal Server Error.
 */
router.get("/verified", isRecruiterOrAdmin, asyncCatch(getVerifiedUserEmails));

/**
 * @swagger
 * /participants/applied:
 *  get:
 *    summary: Get emails of participants that have already submitted applications but have not yet been admitted
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Participants Module]
 *    description: Retrieves list of emails of participants that have already submitted applications but have not yet admitted. Access - Recruiter or Admin
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Forbidden.
 *      500:
 *        description: Internal Server Error.
 */
router.get("/applied", isRecruiterOrAdmin, asyncCatch(getAppliedUserEmails));

/**
 * @swagger
 * /participants/admitted:
 *  get:
 *    summary: Get emails of admitted participants that have not yet confirmed
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Participants Module]
 *    description: Retrieves list of emails of participants that have been admitted but not yet confirmed. Access - Recruiter or Admin
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Forbidden.
 *      500:
 *        description: Internal Server Error.
 */
router.get("/admitted", isRecruiterOrAdmin, asyncCatch(getAdmittedUserEmails));

/**
 * @swagger
 * /participants/confirmed:
 *  get:
 *    summary: Get emails of confirmed participants
 *    security:
 *    - apiKeyAuth: []
 *    tags: [Participants Module]
 *    description: Retrieves list of emails of confirmed participants. Access - Recruiter or Admin
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Forbidden.
 *      500:
 *        description: Internal Server Error.
 */
router.get(
  "/confirmed",
  isRecruiterOrAdmin,
  asyncCatch(getConfirmedUserEmails)
);

export default router;
