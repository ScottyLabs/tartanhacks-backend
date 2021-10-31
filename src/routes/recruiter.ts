import express, { Router } from "express";
import { createSponsor, getSponsor } from "../controllers/SponsorController";
import { makeRecruiter, removeRecruiter } from "../controllers/UserController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Recruiter Module
 *  description: Endpoints to manage recruiters (user representatives of sponsors)
 */

/**
 * @swagger
 * /recruiter/{id}:
 *   post:
 *     summary: Make an existing user into a recruiter for a sponsor
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Recruiter Module]
 *     description: Make an existing user into a recruiter. Access - Admin.
 *     parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sponsor:
 *                 type: string
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
router.post("/:id", isAdmin, asyncCatch(makeRecruiter));

/**
 * @swagger
 * /recruiter/remove/{id}:
 *   post:
 *     summary: Demote an existing recruiter
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Recruiter Module]
 *     description: Demote an existing recruiter. Access - Admin.
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
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/remove/:id", isAdmin, asyncCatch(removeRecruiter));

export default router;
