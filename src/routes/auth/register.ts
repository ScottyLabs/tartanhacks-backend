import { Request, Response } from "express";
import {
  generateAuthToken,
  generateEmailVerificationToken,
} from "src/controllers/AuthController";
import { sendVerificationEmail } from "src/controllers/EmailController";
import BadRequestError from "src/errors/BadRequestError";
import ServerError from "src/errors/ServerError";
import generateHash from "src/util/generateHash";
import { z } from "zod";
import { isRegistrationOpen } from "../../controllers/SettingsController";

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user
 *     tags: [Authentication Module]
 *     description: >
 *       Creates new user account. This sends a verification email to the user containing a link to verify their account.
 *       The base URL used in this verification link is from the request's `Origin` header. Access - Open
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
 *       403:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * Create a new account
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { email: emailRaw, password } = schema.parse(req.body);
  const email = emailRaw.toLowerCase();
  const { origin } = req.headers;

  const registrationOpen = await isRegistrationOpen();
  if (!registrationOpen) {
    throw new BadRequestError("Registration is closed");
  }

  const passwordHash = generateHash(password);

  // Create user instance
  const user = await res.locals.prisma.user.create({
    data: {
      email,
      password: passwordHash,
    },
  });

  // Generate JWT auth token
  const authToken = generateAuthToken(user.id);

  // Only return subset of fields
  const { id, status } = user;

  res.json({
    id,
    email,
    status,
    token: authToken,
  });

  const emailToken = generateEmailVerificationToken(email);
  try {
    await sendVerificationEmail(email, emailToken, origin);
  } catch (err) {
    throw new ServerError(
      "Failed to send verification email for user: " + email
    );
  }
}
