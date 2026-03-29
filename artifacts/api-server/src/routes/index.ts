import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tasksRouter from "./tasks";
import tagsRouter from "./tags";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tasksRouter);
router.use(tagsRouter);

export default router;
