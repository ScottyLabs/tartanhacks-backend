import { Status } from "@prisma/client";
import { Request, Response } from "express";
import { decryptEmailVerificationToken } from "src/controllers/AuthController";
import BadRequestError from "src/errors/BadRequestError";
import NotFoundError from "src/errors/NotFoundError";
import { z } from "zod";

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

const schema = z.object({
  token: z.string(),
});

/**
 * Verify a user using their email verification token
 */
export default async function verify(
  req: Request,
  res: Response
): Promise<void> {
  const { token } = schema.parse(req.headers);

  try {
    // Decrypt token
    const email = decryptEmailVerificationToken(token);

    const user = await prisma.user.findUnique({ where: { email } });
    if (user == null) {
      throw new NotFoundError("User not found");
    }

    // Only set status to VERIFIED if current status is UNVERIFIED
    if (user.status !== Status.UNVERIFIED) {
      throw new BadRequestError("User is already verified!");
    }

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        status: Status.VERIFIED,
      },
    });

    res.status(200).send();
  } catch (err) {
    if (err.name === "TokenExpirerError") {
      throw new BadRequestError("Expired token");
    } else if (err.name === "JsonWebTokenError") {
      throw new BadRequestError("Malformed verification token");
    } else {
      throw err;
    }
  }
}
