// backend/src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import employeeRoutes from "./modules/employees/employee.routes";
import leaveRoutes from "./modules/leave/leave.routes";
import navigationRoutes from "./modules/navigation/navigation.routes";
import timesheetRoutes from "./modules/time/timesheet.routes";
import recruitmentRoutes from "./modules/recruitment/recruitment.routes";
import performanceRoutes from "./modules/performance/performance.routes";
import directoryRoutes from "./modules/directory/directory.routes";
import buzzRoutes from "./modules/buzz/buzz.routes";
import adminRoutes from "./modules/admin/admin.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import claimRoutes from "./modules/claim/claim.routes";
import maintenanceRoutes from "./modules/maintenance/maintenance.routes";
import helpRoutes from "./modules/help/help.routes";
import pimRoutes from "./modules/pim/pim.routes";
import myInfoRoutes from "./modules/my-info/myInfo.routes";
import leaveEntitlementRoutes from "./modules/leave/leaveEntitlement/leaveEntitlement.routes";
import emailConfigRoutes from "./modules/admin/config/emailConfig.routes";
import qualificationRoutes from "./modules/admin/qualifications/Qualification.Routes";
import pimConfigRoutes from "./modules/pim/pimConfig/routes/pimConfig.routes";


const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "backend is alive" });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/navigation", navigationRoutes);

app.use("/api/time/timesheets", timesheetRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/buzz", buzzRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/leave-entitlements", leaveEntitlementRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/time/timesheets", timesheetRoutes);
app.use("/api/time/attendance", attendanceRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/buzz", buzzRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/claim", claimRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/help", helpRoutes);
app.use("/api/pim", pimRoutes);


app.use("/api/my-info", myInfoRoutes);
app.use("/config/email", emailConfigRoutes);

app.use("/api/qualifications", qualificationRoutes);
app.use("/pim-config", pimConfigRoutes);

app.use(errorHandler);

export default app;
