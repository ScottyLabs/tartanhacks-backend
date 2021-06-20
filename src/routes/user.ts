import express, { Router } from "express";
import { submitProfile } from "../controllers/ProfileController";
import { isAuthenticated } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: User Module
 *  description: Endpoints for personal user control. Access - User only
 */

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Submit a user application
 *     tags: [User Module]
 *     description: Submit a user application. Access - Admin only
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               age:
 *                 type: integer
 *               school:
 *                 type: string
 *               college:
 *                 type: string
 *                 enum: [SCS, CIT, CFA, Dietrich, MCS, Tepper, Heinz]
 *               level:
 *                 type: string
 *                 enum: [Undergraduate, Masters, Doctorate, Other]
 *               graduationYear:
 *                 type: integer
 *                 minimum: 2022
 *                 maximum: 2027
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Prefer not to say, Other]
 *               genderOther:
 *                 type: string
 *               ethnicity:
 *                 type: string
 *                 enum: [Native American, Asian, Black, Pacific Islander, White, Hispanic, Other]
 *               ethnicityOther:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *                 validation: '^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$'
 *               major:
 *                 type: string
 *               coursework:
 *                 type: string
 *               languages:
 *                 type: string
 *               hackathonExperience:
 *                 type: string
 *                 enum: [0, 0-3, 4+]
 *               workPermission:
 *                 type: string
 *                 enum: [Citizen, Sponsorship, No sponsorship]
 *               workLocation:
 *                 type: string
 *               workStrengths:
 *                 type: string
 *               sponsorRanking:
 *                 type: array
 *                 items:
 *                   type: string
 *               resume:
 *                 type: string
 *               github:
 *                 type: string
 *               design:
 *                 type: string
 *               website:
 *                 type: string
 *               essays:
 *                 type: array
 *                 items:
 *                   type: string
 *               dietaryRestrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *               shirtSize:
 *                 type: string
 *                 enum: [XS, S, M, L, XL, XXL, WXS, WS, WM, WL, WXL, WXXL]
 *               wantsHardware:
 *                 type: boolean
 *               address:
 *                 type: string
 *               region:
 *                 type: string,
 *                 enum: [Rural, Suburban, Urban]
 *     responses:
 *       200:
 *           description: Success.
 *       400:
 *           description: Bad request
 *       401:
 *           description: Unauthorized.
 *       404:
 *           description: User does not exist.
 *       500:
 *           description: Internal Server Error.
 * 
 *
 */
router.put("/profile", isAuthenticated, submitProfile);

export default router;
