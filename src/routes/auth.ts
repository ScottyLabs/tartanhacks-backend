import express, { Router } from "express";
import {
  login,
  register,
  resendVerificationEmail,
  resetPassword,
  sendPasswordResetEmail,
  verify,
} from "../controllers/AuthController";
import { asyncCatch } from "../util/asyncCatch";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Authentication Module
 *  description: Endpoints to manage user authentication.
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user
 *     tags: [Authentication Module]
 *     description: Creates new user account. Access - Open
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
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
router.post("/register", asyncCatch(register));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication Module]
 *     description: Verifies user credentials. Access - Open
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *          description: Success.
 *       401:
 *          description: Unauthorized.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/login", asyncCatch(login));

/**
 * @swagger
 * /auth/verify/{token}:
 *   get:
 *     summary: Verify a user by their token
 *     tags: [Authentication Module]
 *     description: Verifies a user. Access - Open
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Email verification token of a user
 *     responses:
 *       200:
 *          description: Success.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/verify/:token", asyncCatch(verify));

/**
 * @swagger
 * /auth/verify/resend:
 *   post:
 *     summary: Resend a user verification email
 *     tags: [Authentication Module]
 *     description: Resend a user verification email. Access - Open
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *          description: Success.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/verify/resend", asyncCatch(resendVerificationEmail));

/**
 * @swagger
 * /auth/reset:
 *   post:
 *     summary: Send a password reset email to a user
 *     tags: [Authentication Module]
 *     description: Send a password reset email to a user. Access - Open
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *          description: Success.
 *       401:
 *          description: Unauthorized.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/reset", asyncCatch(sendPasswordResetEmail));

/**
 * @swagger
 * /auth/reset/password:
 *   post:
 *     summary: Reset a user's password
 *     tags: [Authentication Module]
 *     description: Reset a user's password Access - Open
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *          description: Success.
 *       401:
 *          description: Unauthorized.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/reset/password", asyncCatch(resetPassword));

export default router;
