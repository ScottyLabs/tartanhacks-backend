import express, { Router } from "express";
import {
  addNewCheckInItem,
  editCheckInItem,
  getCheckInItemByID,
  getAllCheckInItems,
  deleteCheckInItem,
  checkInUser,
  getCheckInHistory,
} from "../controllers/CheckInController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin, canCheckIn, isOwnerOrAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Check In Module
 *  description: Endpoints to manage check in items and histories.
 */

/**
 * @swagger
 * /check-in/history/{id}:
 *   get:
 *     summary: Get Check In history by user ID
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Check In Module]
 *     description: Get a user's check in history. Access - Admin or User(Own).
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
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
router.get("/history/:id", isOwnerOrAdmin, asyncCatch(getCheckInHistory));

/**
 * @swagger
 * /check-in:
 *   post:
 *     summary: Add new Check In item
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Check In Module]
 *     description: Creates new Check in Item. Access - Admin.
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
 *               points:
 *                 type: number
 *               accessLevel:
 *                 type: string
 *               enableSelfCheckIn:
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
router.post("/", isAdmin, asyncCatch(addNewCheckInItem));

/**
 * @swagger
 * /check-in/{id}:
 *   patch:
 *     summary: Edit check in item
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Check In Module]
 *     description: Edit existing check in item information. All body parameters are optional. If unspecified, the parameters are not updated. Access - Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Check In Item ID
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
 *               points:
 *                 type: number
 *               accessLevel:
 *                 type: string
 *               enableSelfCheckIn:
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
router.patch("/:id", isAdmin, asyncCatch(editCheckInItem));

/**
 * @swagger
 * /check-in/{id}:
 *   get:
 *     summary: Get Check In item by ID
 *     tags: [Check In Module]
 *     description: Get a single Check In item by iD. Access - Public.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Check In Item ID
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
router.get("/:id", asyncCatch(getCheckInItemByID));

/**
 * @swagger
 * /check-in/:
 *   get:
 *     summary: Get Check In items
 *     tags: [Check In Module]
 *     description: Get all check in items. Access - Public.
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
router.get("/", asyncCatch(getAllCheckInItems));

/**
 * @swagger
 * /check-in/{id}:
 *   delete:
 *     summary: Delete Check In item by ID
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Check In Module]
 *     description: Delete Check In item by specifying ID. Access - Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Check In Item ID
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
router.delete("/:id", isAdmin, asyncCatch(deleteCheckInItem));

/**
 * @swagger
 * /check-in/user:
 *   put:
 *     summary: Check a User In
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Check In Module]
 *     description: Checks in a user to a check in item. Access - Admin Users can check in any user for any check in item. Participants can only check themselves in for check-in items that have self check-in enabled.
 *     parameters:
 *       - in: query
 *         name: userID
 *         required: true
 *         schema:
 *            type: string
 *       - in: query
 *         name: checkInItemID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *          description: Success.
 *       404:
 *          description: check in item or user not found.
 *       400:
 *          description: Bad Request.
 *       500:
 *          description: Internal Server Error.
 */

router.put("/user", canCheckIn, asyncCatch(checkInUser));

export default router;
