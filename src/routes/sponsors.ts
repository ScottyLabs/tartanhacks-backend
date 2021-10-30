import express, { Router } from "express";
import {
  getSponsors
} from "../controllers/SponsorController";
import { asyncCatch } from "../util/asyncCatch";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Sponsor Module
 *  description: Endpoints to manage sponsor creation and retrieving
 */

/**
 * @swagger
 * /sponsors/:
 *   get:
 *     summary: Get all available sponsor companies
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Sponsor Module]
 *     description: Gets all sponsors. Access - Public.
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
router.get("/", asyncCatch(getSponsors));

export default router;
