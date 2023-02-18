import { Request, Response } from "express";
import ServerError from "src/errors/ServerError";

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get the settings object
 *     tags: [Settings Module]
 *     description: Get the settings object. Access - Admin only
 *     security:
 *       - apiKeyAuth: []
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

/**
 * Retrieve the application settings
 */
export async function getSettings(req: Request, res: Response): Promise<void> {
  const settings = await prisma.settings.findFirst();

  if (settings == null) {
    throw new ServerError(
      "Settings object does not exist! Has the database been seeded?"
    );
  }

  res.json(settings);
}
