import express, { Router } from "express";
import {
  createNewProject,
  editProject,
  getProjectByID,
  getAllProjects,
  deleteProject,
  getAllPrizes,
} from "../controllers/ProjectsController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Projects Module
 *  description: Endpoints to manage dynamic projects.
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create new project
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Creates new project. Access - Admin.
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
 *               team:
 *                 type: string
 *               slides:
 *                 type: string
 *               video:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/", isAdmin, asyncCatch(createNewProject));

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Edit project info
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Edit existing project information. All body parameters are optional. If unspecified, the parameters are not updated. Access - Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
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
 *               team:
 *                 type: string
 *               slides:
 *                 type: string
 *               video:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.patch("/:id", isAdmin, asyncCatch(editProject));

/**
 * @swagger
 * /projects/prizes:
 *   get:
 *     summary: Get Prizes
 *     tags: [Projects Module]
 *     description: Get all Prizes. Access - Public.
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/prizes", asyncCatch(getAllPrizes));

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get Project by ID
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Get a single project by iD. Access - Public.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/:id", asyncCatch(getProjectByID));

/**
 * @swagger
 * /projects/:
 *   get:
 *     summary: Get Projects
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Get all Projects. Access - Admin.
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/", isAdmin, asyncCatch(getAllProjects));

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete project by ID
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Delete project by specifying ID. Access - Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.delete("/:id", isAdmin, asyncCatch(deleteProject));

export default router;
