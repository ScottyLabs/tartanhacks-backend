import express, { Router } from "express";
import { getUserStatus } from "../controllers/StatusController";
import {
  declineAcceptance,
  fileMiddleware,
  getUserProfile,
  submitConfirmation,
  submitProfile,
  submitResume,
} from "../controllers/ProfileController";
import { asyncCatch } from "../util/asyncCatch";
import {
  isAuthenticated,
  isOwnerOrAdmin,
  isOwnerRecruiterOrAdmin,
} from "./middleware";
import { getCurrentUserTeam } from "../controllers/TeamController";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: User Module
 *  description: Endpoints for personal user control. Access - User only
 */

/**
 * @swagger
 * /user/profile/{userId}:
 *   get:
 *     summary: Get a user's application profile
 *     tags: [User Module]
 *     description: Get a user's application profile. Access - Owner, Recruiter, or Admin only
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *     - in: path
 *       name: userId
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *           description: Success.
 *       400:
 *           description: Bad request
 *       403:
 *           description: Unauthorized.
 *       404:
 *           description: User does not exist.
 *       500:
 *           description: Internal Server Error.
 */
router.get("/profile/:id", isOwnerRecruiterOrAdmin, asyncCatch(getUserProfile));

/**
 * @swagger
 * /user/status/{userId}:
 *   get:
 *     summary: Get a user's status (application progress)
 *     tags: [User Module]
 *     description: Get a user's status. Access - Owner or Admin only
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *     - in: path
 *       name: userId
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *           description: Success.
 *       400:
 *           description: Bad request
 *       403:
 *           description: Unauthorized.
 *       404:
 *           description: User does not exist.
 *       500:
 *           description: Internal Server Error.
 */
router.get("/status/:id", isOwnerOrAdmin, asyncCatch(getUserStatus));

/**
 * @swagger
 * /user/team:
 *   get:
 *     summary: Get the current user's team
 *     tags: [User Module]
 *     description: Get the current user's team. Access - Owner only
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *           description: Success.
 *       400:
 *           description: Bad request or user does not have a team
 *       403:
 *           description: Unauthorized.
 *       500:
 *           description: Internal Server Error.
 */
router.get("/team", isAuthenticated, asyncCatch(getCurrentUserTeam));

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Submit a user application
 *     tags: [User Module]
 *     description: Submit a user application. Access - User only
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
 *       403:
 *           description: Unauthorized.
 *       404:
 *           description: User does not exist.
 *       500:
 *           description: Internal Server Error.
 */
router.put("/profile", isAuthenticated, asyncCatch(submitProfile));

/**
 * @swagger
 * /user/resume:
 *  post:
 *    summary: Submit a user's resume
 *    security:
 *    - apiKeyAuth: []
 *    tags: [User Module]
 *    description: Submit a user's resume. Must have an associated profile. Access - User
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              file:
 *                type: string
 *                format: binary
 *    responses:
 *      200:
 *        description: Success.
 *      400:
 *        description: Bad request
 *      403:
 *        description: Unauthorized.
 *      500:
 *        description: Internal Server Error.
 */
router.post(
  "/resume",
  isAuthenticated,
  fileMiddleware,
  asyncCatch(submitResume)
);

/**
 * @swagger
 * /user/confirmation:
 *  put:
 *    summary: Submit a user's confirmation
 *    security:
 *    - apiKeyAuth: []
 *    tags: [User Module]
 *    description: Submit a user's confirmation. Must have been accepted. Access - User
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              signatureLiability:
 *                type: boolean
 *              signaturePhotoRelease:
 *                type: boolean
 *              signatureCodeOfConduct:
 *                type: boolean
 *              mlhCodeOfConduct:
 *                type: boolean
 *              mlhEventLogistics:
 *                type: boolean
 *              mlhPromotional:
 *                type: boolean
 *    responses:
 *      200:
 *        description: Success.
 *      400:
 *        description: Bad request
 *      403:
 *        description: Unauthorized.
 *      500:
 *        description: Internal Server Error.
 */
router.put("/confirmation", isAuthenticated, asyncCatch(submitConfirmation));

/**
 * @swagger
 * /user/decline:
 *  put:
 *    summary: Decline a user's acceptance
 *    security:
 *    - apiKeyAuth: []
 *    tags: [User Module]
 *    description: Decline a user's acceptance. Must have been accepted. Access - User
 *    responses:
 *      200:
 *        description: Success.
 *      400:
 *        description: Bad request
 *      403:
 *        description: Unauthorized.
 *      500:
 *        description: Internal Server Error.
 */
router.put("/decline", isAuthenticated, asyncCatch(declineAcceptance));

export default router;
