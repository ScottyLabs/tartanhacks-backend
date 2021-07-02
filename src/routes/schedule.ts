import express, { Router } from "express";
import {
  addNewScheduleItem,
  editScheduleItem,
} from "../controllers/ScheduleController";
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
 * /schedule:
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
router.post("/", isAdmin, addNewScheduleItem);

/**
 * @swagger
 * /schedule/{id}:
 *   patch:
 *     summary: Edit schedule item
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Schedule Module]
 *     description: Edit existing schedule item information. All body parameters are optional. If unspecified, the parameters are not updated. Access - Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Schedule Item ID
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
router.patch("/:id", isAdmin, editScheduleItem);

export default router;
