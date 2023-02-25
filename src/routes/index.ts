import express from "express";
import adminRouter from "./admin/admin";
import analyticsRouter from "./analytics";
import authRouter from "./auth/index";
import bookmarkRouter from "./bookmark";
import bookmarksRouter from "./bookmarks";
import checkInRouter from "./checkin";
import judgeRouter from "./judge";
import leaderboardRouter from "./leaderboard";
import participantsRouter from "./participants";
import prizesRouter from "./prizes";
import projectsRouter from "./projects";
import recruiterRouter from "./recruiter";
import requestsRouter from "./requests";
import scheduleRouter from "./schedule";
import settingsRouter from "./settings";
import sponsorRouter from "./sponsor";
import sponsorsRouter from "./sponsors";
import teamRouter from "./team";
import teamsRouter from "./teams";
import testAccountRouter from "./test-account";
import userRouter from "./user";
import usersRouter from "./users";

const router = express.Router();
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/bookmark", bookmarkRouter);
router.use("/bookmarks", bookmarksRouter);
router.use("/check-in", checkInRouter);
router.use("/judges", judgeRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/participants", participantsRouter);
router.use("/prizes", prizesRouter);
router.use("/projects", projectsRouter);
router.use("/recruiter", recruiterRouter);
router.use("/schedule", scheduleRouter);
router.use("/settings", settingsRouter);
router.use("/sponsor", sponsorRouter);
router.use("/sponsors", sponsorsRouter);
router.use("/team", teamRouter);
router.use("/teams", teamsRouter);
router.use("/user", userRouter);
router.use("/users", usersRouter);
router.use("/requests", requestsRouter);
router.use("/analytics", analyticsRouter);
router.use("/test-account", testAccountRouter);

export default router;
