import express, { Router } from "express";
import { getSettings, updateSettings } from "../controllers/SettingsController";
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

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update the settings
 *     tags: [Settings Module]
 *     description: Update the settings. Access - Admin only
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeOpen:
 *                 type: string
 *                 format: date-time
 *               timeClose:
 *                 type: string
 *                 format: date-time
 *               timeConfirm:
 *                 type: string
 *                 format: date-time
 *               enableWhitelist
 *                 type: boolean
 *               whitelistedEmails:
 *                 type: array
 *                 items:
 *                   type: string
 *               waitlistText:
 *                 type: string
 *               acceptanceText:
 *                 type: string
 *               confirmationText:
 *                 type: string
 *               allowMinors:
 *                 type: boolean
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
router.put("/", isAdmin, updateSettings);

export default router;
