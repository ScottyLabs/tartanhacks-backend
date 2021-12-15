import express, { Router } from "express";
import {
  createRecruiter,
  makeRecruiter,
  removeRecruiter,
} from "../controllers/RecruiterController";
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
 * /recruiter:
 *   post:
 *     summary: Create a new recruiter
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Recruiter Module]
 *     description: Create a new recruiter user. Access - Admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sponsorId:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
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
router.post("/", isAdmin, asyncCatch(createRecruiter));

/**
 * @swagger
 * /recruiter/{id}:
 *   put:
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
 *       403:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.put("/:id", isAdmin, asyncCatch(makeRecruiter));

/**
 * @swagger
 * /recruiter/{id}:
 *   delete:
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
 *       403:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.delete("/:id", isAdmin, asyncCatch(removeRecruiter));

export default router;
