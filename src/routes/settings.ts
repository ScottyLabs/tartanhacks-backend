import express, { Router } from "express";
import {
  getCloseTime,
  getConfirmTime,
  getOpenTime,
  handleGetSettings,
  updateSettings,
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

export default router;
