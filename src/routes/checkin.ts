import express, { Router } from "express";
// import {} from "../controllers/CheckInController";
import { isAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Check In Module
 *  description: Endpoints to manage check in items and histories.
 */

export default router;
