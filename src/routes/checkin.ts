import express, { Router } from "express";
import {
  addNewCheckInItem,
  editCheckInItem,
  getCheckInItemByID,
  getAllCheckInItems,
  deleteCheckInItem,
  getLeaderBoard,
  checkInUser,
} from "../controllers/CheckInController";
import { isAdmin, canCheckIn } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Check In Module
 *  description: Endpoints to manage check in items and histories.
 */

/**
 * @swagger
 * /check-in/leaderboard:
 *   get:
 *     summary: Get Check In leaderboard
 *     tags: [Check In Module]
 *     description: Get check in leader board. Access - Public.
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
router.get("/leaderboard", getLeaderBoard);

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
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/", isAdmin, addNewCheckInItem);

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
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.patch("/:id", isAdmin, editCheckInItem);

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
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/:id", getCheckInItemByID);

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
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/", getAllCheckInItems);

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
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.delete("/:id", isAdmin, deleteCheckInItem);

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

router.put("/user", canCheckIn, checkInUser);

export default router;
