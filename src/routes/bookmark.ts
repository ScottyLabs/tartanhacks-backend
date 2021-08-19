import express, { Router } from "express";
import { createBookmark } from "../controllers/BookmarkController";
import { createSponsor, getSponsor } from "../controllers/SponsorController";
import { makeRecruiter, removeRecruiter } from "../controllers/UserController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Bookmark Module
 *  description: Endpoints to bookmarks
 */

/**
 * @swagger
 * /bookmark:
 *   post:
 *     summary: Create a new bookmark
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Bookmark Module]
 *     description: Create a new bookmark for a user. Access - User.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [PARTICIPANT, PROJECT]
 *                 required: true
 *               participant:
 *                 type: string
 *               project:
 *                 type: string
 *               description:
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
router.post("/", isAdmin, asyncCatch(createBookmark));

export default router;
