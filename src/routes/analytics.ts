import express, { Router } from "express";
import { isAdmin } from "./middleware";
import { asyncCatch } from "../util/asyncCatch";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Analytics Module
 *  description: Endpoints for user analytics. Access - Admin only
 */
