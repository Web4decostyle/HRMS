import { Router } from "express";
import attendanceRoutes from "./attendance/attendance.routes";

const router = Router();

router.use("/attendance", attendanceRoutes);

export default router;
