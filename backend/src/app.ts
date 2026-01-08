import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";

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
import claimConfigRoutes from "./modules/claim/claimConfig.routes";
import pimReportRouter from "./modules/pim/reports/pimReport.routes";
import jobTitleRoutes from "./modules/admin/job/jobTitle/jobTitle.routes";
import payGradeRoutes from "./modules/admin/job/payGrade/payGrade.routes";
import employmentStatusRoutes from "./modules/admin/job/employmentStatus/employmentStatus.routes";
import jobCategoryRoutes from "./modules/admin/job/jobCategory/jobCategory.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import timeRoutes from "./modules/time/time.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import changeRequestRoutes from "./modules/change-requests/changeRequest.routes";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "backend is alive" });
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Core
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/navigation", navigationRoutes);

// Modules
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/buzz", buzzRoutes);

app.use("/api/leave", leaveRoutes);
app.use("/api/leave-entitlements", leaveEntitlementRoutes);

app.use("/api/time/timesheets", timesheetRoutes);
app.use("/api/time", timeRoutes);
app.use("/api/time/attendance", attendanceRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin/job-titles", jobTitleRoutes);
app.use("/api/admin/pay-grades", payGradeRoutes);
app.use("/api/admin/employment-status", employmentStatusRoutes);
app.use("/api/admin/job-categories", jobCategoryRoutes);

app.use("/api/claim", claimRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/help", helpRoutes);

app.use("/api/pim", pimRoutes);
app.use("/api/pim/reports", pimReportRouter);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/my-info", myInfoRoutes);

app.use("/config/email", emailConfigRoutes);
app.use("/api/qualifications", qualificationRoutes);
app.use("/api/pim-config", pimConfigRoutes);
app.use("/api/claim-config", claimConfigRoutes);

app.use("/api/change-requests", changeRequestRoutes);

app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

export default app;
