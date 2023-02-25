import express, { Router } from "express";
import { asyncCatch } from "src/util/asyncCatch";
import { isAdmin } from "../middleware";
import { create } from "./create";


/**
 * @swagger
 * tags:
 *  name: Admin Module
 *  description: Endpoints for admin control. Access - Admin only
 */
const router: Router = express.Router();
router.post("/:id", isAdmin, asyncCatch(create));

export default router;
