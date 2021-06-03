import express, { Request, Response, Router } from "express";
import User from "src/models/User";
import UserSchema from "src/models/User";

const router: Router = express.Router();

router.post("/register", (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  // hash password
});

export default router;
