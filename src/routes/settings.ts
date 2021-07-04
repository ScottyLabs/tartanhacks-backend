import express, { Router } from "express";
import { getSettings } from "../controllers/SettingsController";
import { isAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Settings Module
 *  description: Endpoints for settings control. Access - Admin only
 */

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get the settings
 *     tags: [Settings Module]
 *     description: Get the settings. Access - Admin only
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/", isAdmin, getSettings);

export default router;
