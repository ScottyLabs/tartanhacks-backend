import express, { Router } from "express";
import { addNewScheduleItem } from "../controllers/ScheduleController";
import { isAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Schedule Module
 *  description: Endpoints to manage dynamic event schedules.
 */

/**
 * @swagger
 * /schedule/new:
 *   post:
 *     summary: Add new schedule item
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Schedule Module]
 *     description: Creates new user account. Access - Admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: number
 *               endTime:
 *                 type: number
 *               location:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               platform:
 *                 type: string
 *               platformUrl:
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
router.post("/new", isAdmin, addNewScheduleItem);

export default router;
