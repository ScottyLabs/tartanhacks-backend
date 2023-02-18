import { Request, Response } from "express";
import { getSettings } from "src/controllers/SettingsController";
import { z } from "zod";

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update the settings
 *     tags: [Settings Module]
 *     description: Update the settings. Access - Admin only
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeOpen:
 *                 type: string
 *                 format: date-time
 *               timeClose:
 *                 type: string
 *                 format: date-time
 *               timeConfirm:
 *                 type: string
 *                 format: date-time
 *               enableWhitelist:
 *                 type: boolean
 *               whitelistedEmails:
 *                 type: array
 *                 items:
 *                   type: string
 *               waitlistText:
 *                 type: string
 *               acceptanceText:
 *                 type: string
 *               confirmationText:
 *                 type: string
 *               allowMinors:
 *                 type: boolean
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
  timeOpen: z.string().datetime().optional(),
  timeClose: z.string().datetime().optional(),
  timeConfirm: z.string().datetime().optional(),
  requireEduEmails: z.boolean().optional(),
  maxTeamSize: z.number().optional(),
});

/**
 * Update the application settings
 */
export async function updateSettings(
  req: Request,
  res: Response
): Promise<void> {
  const params = schema.parse(req.body);

  const settings = await getSettings();
  await prisma.settings.update({
    where: {
      id: settings.id,
    },
    data: params,
  });
}
