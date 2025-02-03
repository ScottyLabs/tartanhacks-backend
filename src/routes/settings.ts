import express, { Router } from "express";
import {
  getCloseTime,
  getConfirmTime,
  getOpenTime,
  handleGetSettings,
  handleGetWaitlistStatus,
  updateSettings,
  getExpoConfig,
} from "../controllers/SettingsController";
import { asyncCatch } from "../util/asyncCatch";
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
 *     summary: Get the settings object
 *     tags: [Settings Module]
 *     description: Get the settings object. Access - Admin only
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       403:
 *          description: Unauthorized.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/", isAdmin, asyncCatch(handleGetSettings));

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
 *               enableWhitelist:
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
 *       403:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.put("/", isAdmin, asyncCatch(updateSettings));

/**
 * @swagger
 * /settings/time/open:
 *   get:
 *     summary: Get the time when registration opens
 *     tags: [Settings Module]
 *     description: Get the time when registration opens. Access - Public
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       404:
 *          description: Registration open time is disabled or not set.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/time/open", asyncCatch(getOpenTime));

/**
 * @swagger
 * /settings/time/close:
 *   get:
 *     summary: Get the time when registration closes
 *     tags: [Settings Module]
 *     description: Get the time when registration closes. Access - Public
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       404:
 *          description: Registration close time is disabled or not set.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/time/close", asyncCatch(getCloseTime));

/**
 * @swagger
 * /settings/time/confirm:
 *   get:
 *     summary: Get the confirmation deadline
 *     tags: [Settings Module]
 *     description: Get the confirmation deadline. Access - Public
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       404:
 *          description: Confirmation deadline is disabled or not set.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/time/confirm", asyncCatch(getConfirmTime));

/**
 * @swagger
 * /settings/waitlist:
 *   get:
 *     summary: Check whether the waitlist is open
 *     tags: [Settings Module]
 *     description: Returns whether newly registered users should be put on a waitlist. Access - Public
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/waitlist", asyncCatch(handleGetWaitlistStatus));

/**
 * @swagger
 * /config/expo:
 *   get:
 *     summary: Get expo configuration
 *     tags: [Settings Module]
 *     description: Get expo start time and submission deadline
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expoStartTime:
 *                   type: string
 *                   format: date-time
 *                 submissionDeadline:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Configuration not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/expo", asyncCatch(getExpoConfig));

export default router;
