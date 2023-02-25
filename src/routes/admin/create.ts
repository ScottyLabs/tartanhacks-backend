import { Request, Response } from "express";
import {
  generateAuthToken,
  generateEmailVerificationToken,
} from "src/controllers/AuthController";
import { sendVerificationEmail } from "src/controllers/EmailController";
import BadRequestError from "src/errors/BadRequestError";
import NotFoundError from "src/errors/NotFoundError";
import ServerError from "src/errors/ServerError";
import generateHash from "src/util/generateHash";
import { z } from "zod";
import { isRegistrationOpen } from "../../controllers/SettingsController";

/**
 * @swagger
 * /admin/{id}:
 *   post:
 *     summary: Make a user an admin
 *     tags: [Admin Module]
 *     description: Make a user into an admin. Access - Admin only
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to make into an admin
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       403:
 *          description: Unauthorized.
 *       404:
 *          description: User does not exist.
 *       500:
 *          description: Internal Server Error.
 */

const schema = z.object({
  id: z.string(),
});

/**
 * Create a new admin
 */
export async function create(req: Request, res: Response): Promise<void> {
  const { id } = schema.parse(req.params);

  const user = await prisma.user.findUnique({ where: { id } });
  if (user == null) {
    throw new NotFoundError("User not found");
  }

  await prisma.user.update({ where: { id }, data: { admin: true } });

  res.status(200).send()
}
