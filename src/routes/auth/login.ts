import bcrypt from "bcrypt";
import { Request, Response } from "express";
import {
  decryptAuthToken,
  generateAuthToken,
} from "src/controllers/AuthController";
import BadRequestError from "src/errors/BadRequestError";
import NotFoundError from "src/errors/NotFoundError";
import { z } from "zod";

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

const bodySchema = z.object({
  email: z
    .string()
    .email()
    .trim()
    .transform((email) => email.toLowerCase()),
  password: z.string(),
});

const headerSchema = z.object({
  "x-access-token": z.string().optional(),
});

/**
 * Login a user and return the associated user with a fresh authentication token
 */
export default async function register(
  req: Request,
  res: Response
): Promise<void> {
  const token = headerSchema.parse(req.headers)["x-access-token"];

  if (token != null) {
    // Login with token
    const userId = decryptAuthToken(token);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user == null) {
      throw new NotFoundError(
        "Unknown account associated with authentication token"
      );
    }

    const { id, email, status } = user;
    const authToken = generateAuthToken(userId);

    res.json({
      id,
      email,
      status,
      token: authToken,
    });
  } else {
    // Login with info
    const { email, password } = bodySchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    if (user == null) {
      throw new NotFoundError("Unknown account with email: " + email);
    }

    // Verify password is correct
    const { id, status, password: passwordHash } = user;
    const passwordMatch = bcrypt.compareSync(password, passwordHash);

    if (!passwordMatch) {
      throw new BadRequestError("Incorrect password");
    }

    const authToken = generateAuthToken(id);

    res.json({
      id,
      email,
      status,
      token: authToken,
    });
  }
}
