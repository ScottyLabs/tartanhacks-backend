import express, { Router } from "express";
import {
  getParticipantBookmarks,
  getProjectBookmarks
} from "../controllers/BookmarkController";
import { asyncCatch } from "../util/asyncCatch";
import { isAuthenticated } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Bookmark Module
 *  description: Endpoints to bookmarks
 */

/**
 * @swagger
 * /bookmarks/participant:
 *   get:
 *     summary: Get all participant bookmarks of this user
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Bookmark Module]
 *     description: Get all participant bookmarks of this user. Access - User.
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
router.get(
  "/participant",
  isAuthenticated,
  asyncCatch(getParticipantBookmarks)
);

/**
 * @swagger
 * /bookmarks/project:
 *   get:
 *     summary: Get all project bookmarks of this user
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Bookmark Module]
 *     description: Get all project bookmarks of this user. Access - User.
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
router.get("/project", isAuthenticated, asyncCatch(getProjectBookmarks));

export default router;
