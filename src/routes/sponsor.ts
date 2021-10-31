import express, { Router } from "express";
import { createSponsor, getSponsor } from "../controllers/SponsorController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Sponsor Module
 *  description: Endpoints to manage sponsor creation and retrieving
 */

/**
 * @swagger
 * /sponsor/:
 *   post:
 *     summary: Create a new sponsor (company)
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Sponsor Module]
 *     description: Creates new sponsor. Access - Admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
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
router.post("/", isAdmin, asyncCatch(createSponsor));

/**
 * @swagger
 * /sponsor/{id}:
 *   get:
 *     summary: Get sponsor information and associated recruiters
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Sponsor Module]
 *     description: Get sponsor information. Access - Admin.
 *     parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       type: string
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
router.get("/:id", isAdmin, asyncCatch(getSponsor));

export default router;
