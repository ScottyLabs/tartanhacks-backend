import express, { Router } from "express";
import {
  createNewTestAccount,
  deleteAllTestAccounts,
  deleteTestAccount,
} from "src/controllers/TestAccountController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin, isAuthenticated } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Test Account Module
 *  description: Endpoints for creating and managing short-lived test accounts. Access - Admin only
 */

/**
 * @swagger
 * /test-account:
 *   post:
 *     summary: Create a new short-lived test account
 *     tags: [Test Module]
 *     security:
 *     - apiKeyAuth: []
 *     description: Create a new test account. Access - Admin
 *     responses:
 *       200:
 *           description: Success. Returns the login information for a new test account
 *       400:
 *           description: Bad request
 *       500:
 *           description: Internal Server Error.
 */
router.post("/", isAuthenticated, isAdmin, asyncCatch(createNewTestAccount));

/**
 * @swagger
 * /test-account/all:
 *   delete:
 *     summary: Delete all test accounts
 *     tags: [Test Module]
 *     security:
 *     - apiKeyAuth: []
 *     description: Delete all test account. Access - Admin
 *     responses:
 *       200:
 *           description: Success.
 *       400:
 *           description: Bad request
 *       500:
 *           description: Internal Server Error.
 */
router.delete(
  "/all",
  isAuthenticated,
  isAdmin,
  asyncCatch(deleteAllTestAccounts)
);

/**
 * @swagger
 * /test-account/{id}:
 *   delete:
 *     summary: Delete a test account
 *     tags: [Test Module]
 *     security:
 *     - apiKeyAuth: []
 *     description: Delete a test account. Access - Admin
 *     parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *           description: Success.
 *       400:
 *           description: Bad request
 *       500:
 *           description: Internal Server Error.
 */
router.delete("/:id", isAuthenticated, isAdmin, asyncCatch(deleteTestAccount));

export default router;
