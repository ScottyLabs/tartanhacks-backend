import express, { Router } from "express";
import {
  createNewPrize,
  deletePrize,
  editPrize,
  getAllPrizes,
  getPrizeByID,
} from "../controllers/PrizeController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Prizes Module
 *  description: Endpoints to manage prizes.
 */

/**
 * @swagger
 * /prizes:
 *   post:
 *     summary: Create new prize
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Prizes Module]
 *     description: Creates new prize. Access - Admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               eligibility:
 *                 type: string
 *               sponsorName:
 *                 type: string
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
router.post("/", isAdmin, asyncCatch(createNewPrize));

/**
 * @swagger
 * /prizes/{id}:
 *   patch:
 *     summary: Edit prize info
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Prizes Module]
 *     description: Edit existing prize information. All body parameters are optional. If unspecified, the parameters are not updated. Access - Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Prize ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               eligibility:
 *                 type: string
 *               provider:
 *                 type: string
 *               winner:
 *                 type: string
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
router.patch("/:id", isAdmin, asyncCatch(editPrize));

/**
 * @swagger
 * /prizes/{id}:
 *   get:
 *     summary: Get Prize by ID
 *     tags: [Prizes Module]
 *     description: Get a single prize by iD. Access - Public.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Prize ID
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
router.get("/:id", asyncCatch(getPrizeByID));

/**
 * @swagger
 * /prizes:
 *   get:
 *     summary: Get Prizes
 *     tags: [Prizes Module]
 *     description: Get all Prizes. Access - Public.
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
router.get("/", asyncCatch(getAllPrizes));

/**
 * @swagger
 * /prizes/{id}:
 *   delete:
 *     summary: Delete prize by ID
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Prizes Module]
 *     description: Delete prize by specifying ID. Access - Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Prize ID
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
router.delete("/:id", isAdmin, asyncCatch(deletePrize));

export default router;
