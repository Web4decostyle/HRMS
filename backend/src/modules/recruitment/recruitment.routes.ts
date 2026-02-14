import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  createJob,
  listJobs,
  getJob,
  createCandidate,
  listCandidates,
  updateCandidateStatus,
  setInterviewDate,
  getCandidateById,
} from "./recruitment.controller";

import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";
import vacancyRoutes from "./vacancy/vacancy.routes";

const router = Router();

/* ---------- Multer for resume upload ---------- */
const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(__dirname, "../../../uploads/resumes");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
});

/* ---------- Jobs ---------- */
router.post(
  "/jobs",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createJob)
);

router.get(
  "/jobs",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listJobs)
);

router.get(
  "/jobs/:id",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(getJob)
);

/* ---------- Vacancies ---------- */
router.use("/vacancies", vacancyRoutes);

/* ---------- Candidates ---------- */

router.post(
  "/candidates",
  requireAuth,
  requireRole("ADMIN", "HR"),
  uploadResume.single("resume"),
  asyncHandler(createCandidate)
);

router.get(
  "/candidates",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listCandidates)
);

// ✅ Candidate view API used by frontend CandidateViewPage
router.get(
  "/candidates/:id",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(getCandidateById)
);

// ✅ Set interview date -> generates TEMP code
router.patch(
  "/candidates/:id/interview",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(setInterviewDate)
);

// ✅ Status update -> on SELECTED/HIRED generates employeeCode (requires interviewDate)
router.patch(
  "/candidates/:id/status",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(updateCandidateStatus)
);

export default router;
