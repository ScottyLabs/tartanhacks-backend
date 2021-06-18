import express, { Router } from "express";
import { login, register, verify } from "../controllers/AuthController";

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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *          description: Success.
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/register", register);

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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *          description: Success.
 *       404:
 *          description: User does not exist.
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/login", login);

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
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/auth/verify/:token", verify);

export default router;
