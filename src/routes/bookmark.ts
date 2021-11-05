import express, { Router } from "express";
import { createBookmark, deleteBookmark, getBookmark } from "../controllers/BookmarkController";
import { asyncCatch } from "../util/asyncCatch";
import { isRecruiterOrAdmin } from "./middleware";

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
router.post("/", isRecruiterOrAdmin, asyncCatch(createBookmark));

/**
 * @swagger
 * /bookmark/{id}:
 *   get:
 *     summary: Get a bookmark by its ID
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Bookmark Module]
 *     description: |
 *        Get a bookmark by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bookmark ID
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       403:
 *          description: Unauthorized.
 *       404:
 *          description: Bookmark not found
 *       500:
 *          description: Internal Server Error.
 */
router.get("/:id", isRecruiterOrAdmin, asyncCatch(getBookmark));

/**
 * @swagger
 * /bookmark/{id}:
 *   delete:
 *     summary: Delete a bookmark by its ID
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Bookmark Module]
 *     description: |
 *        Delete a bookmark by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bookmark ID
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       403:
 *          description: Unauthorized.
 *       404:
 *          description: Bookmark not found
 *       500:
 *          description: Internal Server Error.
 */
router.delete("/:id", isRecruiterOrAdmin, asyncCatch(deleteBookmark));

export default router;
