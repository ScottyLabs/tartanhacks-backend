import express, { Router } from "express";
import {
  addNewScheduleItem,
  editScheduleItem,
  getScheduleItemByID,
  getAllScheduleItems,
  deleteScheduleItem,
} from "../controllers/ScheduleController";
import { asyncCatch } from "../util/asyncCatch";
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
 *     description: Creates new schedule item. Access - Admin.
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
 *                 enum: ["IN_PERSON", "ZOOM", "HOPIN", "DISCORD", "YOUTUBE", "OTHER"]
 *               platformUrl:
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
router.post("/", isAdmin, asyncCatch(addNewScheduleItem));

/**
 * @swagger
 * /schedule/{id}:
 *   patch:
 *     summary: Edit schedule item
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
 *       403:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.patch("/:id", isAdmin, asyncCatch(editScheduleItem));

/**
 * @swagger
 * /schedule/{id}:
 *   get:
 *     summary: Get Schedule item by ID
 *     tags: [Schedule Module]
 *     description: Get a single schedule item by iD. Access - Public.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Schedule Item ID
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
router.get("/:id", asyncCatch(getScheduleItemByID));

/**
 * @swagger
 * /schedule/:
 *   get:
 *     summary: Get Schedule items
 *     tags: [Schedule Module]
 *     description: Get all schedule items. Access - Public.
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
router.get("/", asyncCatch(getAllScheduleItems));

/**
 * @swagger
 * /schedule/{id}:
 *   delete:
 *     summary: Delete Schedule item by ID
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Schedule Module]
 *     description: Delete schedule item by specifying ID. Access - Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Schedule Item ID
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
router.delete("/:id", isAdmin, asyncCatch(deleteScheduleItem));
export default router;
