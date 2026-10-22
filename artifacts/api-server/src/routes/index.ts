import { Router, type IRouter } from "express";
import healthRouter from "./health";
import skillRouter from "./skillhalflife";

const router: IRouter = Router();

router.use(healthRouter);
router.use(skillRouter);

export default router;
