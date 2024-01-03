import express, { Router } from "express";
import {
  declineAcceptance,
  displayNameAvailable,
  fileMiddleware,
  getOwnProfile,
  removeProfilePicture,
  setStatus,
  submitConfirmation,
  submitProfile,
  submitProfilePicture,
  submitResume,
} from "../controllers/ProfileController";
import { getOwnTeam } from "../controllers/TeamController";
import { getOwnVerificationCode } from "../controllers/UserController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin, isAuthenticated } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: User Module
 *  description: Endpoints for personal user control. Access - User only
 */

/**
 * @swagger
 * /user/name/available:
 *   post:
 *     summary: Check if a display name is still available
 *     tags: [User Module]
 *     security:
 *     - apiKeyAuth: []
 *     description: Check if a display name is still available. Access - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *           description: Success. Returns `true` or `false`
 *       400:
 *           description: Bad request
 *       500:
 *           description: Internal Server Error.
 */
router.post(
  "/name/available",
  isAuthenticated,
  asyncCatch(displayNameAvailable)
);

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get current user's application profile
 *     tags: [User Module]
 *     description: Get current user's application profile. Access - Owner
 *     security:
 *       - apiKeyAuth: []
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
router.get("/profile", isAuthenticated, asyncCatch(getOwnProfile));

/**
 * @swagger
 * /user/team:
 *   get:
 *     summary: Get the current user's team
 *     tags: [User Module]
 *     description: Get the current user's team. Access - User
 *     security:
 *       - apiKeyAuth: []
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
router.get("/team", isAuthenticated, asyncCatch(getOwnTeam));

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
 *               displayName:
 *                 type: string
 *                 required: true
 *               firstName:
 *                 type: string
 *                 required: true
 *               lastName:
 *                 type: string
 *                 required: true
 *               age:
 *                 type: integer
 *                 required: true
 *               school:
 *                 type: string
 *                 required: true
 *               college:
 *                 type: string
 *                 enum: [SCS, CIT, CFA, Dietrich, MCS, Tepper, Heinz]
 *               collegeLevel:
 *                 type: string
 *                 enum: [Undergraduate, Masters, Doctorate, Other]
 *               graduationYear:
 *                 type: integer
 *                 minimum: 2023
 *                 maximum: 2028
 *                 required: true
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Prefer not to say, Other]
 *                 required: true
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
 *                 items:
 *                   type: string
 *               github:
 *                 type: string
 *                 required: true
 *               linkedin:
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
 *               attendingPhysically:
 *                 type: boolean
 *               notes:
 *                 type: string
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
 * /user/profile-picture:
 *  post:
 *    summary: Submit a profile picture
 *    security:
 *    - apiKeyAuth: []
 *    tags: [User Module]
 *    description: Submit a profile picture for the current user. Must have an associated profile. Access - User
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
  "/profile-picture",
  isAuthenticated,
  fileMiddleware,
  asyncCatch(submitProfilePicture)
);

/**
 * @swagger
 * /user/profile-picture:
 *  delete:
 *    summary: Clear the user's profile picture
 *    security:
 *    - apiKeyAuth: []
 *    tags: [User Module]
 *    description: Clear the profile picture for the current user. Must have an associated profile. Access - User
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
router.delete(
  "/profile-picture",
  isAuthenticated,
  fileMiddleware,
  asyncCatch(removeProfilePicture)
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
 *              signatureCodeOfConduct:
 *                type: boolean
 *              willMentor:
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

/**
 * @swagger
 * /user/verification:
 *  get:
 *    summary: Get a user's verification code.
 *    security:
 *    - apiKeyAuth: []
 *    tags: [User Module]
 *    description: Get a user's verification code. If it does not exist or is expired, generate a new one. Access - User
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
router.get(
  "/verification",
  isAuthenticated,
  asyncCatch(getOwnVerificationCode)
);

/**
 * @swagger
 * /user/set-status:
 *  put:
 *    summary: Set a user's status
 *    security:
 *    - apiKeyAuth: []
 *    tags: [User Module]
 *    description: Set the status of a user. Access - Admin.
 *    requestBody:
 *      required: true
 *      content:
 *       application/json:
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *               type: string
 *              status:
 *                type: string
 *                enum: [UNVERIFIED, VERIFIED, COMPLETED_PROFILE, ADMITTED, REJECTED, CONFIRMED, DECLINED]
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
router.put("/set-status", isAdmin, asyncCatch(setStatus));

export default router;
