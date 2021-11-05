import express, { Router } from "express";
import { createBookmark } from "../controllers/BookmarkController";
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
 *     description: |
 *        Create a new bookmark for a user.
 *
 *        `type` should be either "PARTICIPANT" or "PROJECT"
 *
 *        if `PARTICIPANT`, then the `participant` field is required and should specify a user ID.
 *
 *        if `PROJECT`, then the `project` field is required and should specify a project ID.
 *
 *        `description` is an optional field for personal notes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookmarkType:
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
 *       403:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/", isAdmin, asyncCatch(createBookmark));

export default router;
