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
import { getUserByVerificationCode } from "../controllers/AuthController";

const router: Router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication Module]
 *     description: >
 *      Verifies user credentials. Either the login credentials can be specified
 *      in the request body, or an access token can be specified in the header.. Access - Open
 *     requestBody:
 *       required: false
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
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *          description: Success.
 *       403:
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
 *     description: >
 *        Resend a user verification email.
 *        This sends a verification email to the user containing a link to verify their account.
 *        The base URL used in this verification link is from the request's `Origin` header. Access - Open
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
 * /auth/request-reset:
 *   post:
 *     summary: Send a password reset email to a user
 *     tags: [Authentication Module]
 *     description: >
 *        Send a password reset email to a user.
 *        This sends an email to the user containing a link to reset their password.
 *        The base URL used in this reset link is from the request's `Origin` header. Access - Open
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
 *       403:
 *          description: Unauthorized.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/request-reset", asyncCatch(sendPasswordResetEmail));

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
 *       403:
 *          description: Unauthorized.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/reset/password", asyncCatch(resetPassword));

/**
 * @swagger
 * /auth/discord/verify:
 *   post:
 *     summary: Get a user and their team using a verification code
 *     tags: [Authentication Module]
 *     description: Get a user and their team using a verification code. Access - Open
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *          description: Success.
 *       404:
 *          description: Verification code invalid.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/discord/verify", asyncCatch(getUserByVerificationCode));

export default router;
