import { Request, Response, NextFunction } from "express";
import { Job } from "./job.model";
import { Candidate } from "./candidate.model";
import { Vacancy } from "./vacancy/vacancy.model";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ApiError } from "../../utils/ApiError";
import mongoose from "mongoose";
import {
  generateEmployeeCode,
  generateTempEmployeeCode,
} from "./recruitment.utils";

import { User } from "../auth/auth.model";
import { createNotification } from "../notifications/notification.service";

// POST /api/recruitment/jobs
export async function createJob(req: AuthRequest, res: Response) {
  const { title, code, description, hiringManager } = req.body;

  if (!title || !code) {
    throw ApiError.badRequest("title and code are required");
  }

  const existing = await Job.findOne({ code }).exec();
  if (existing) {
    throw new ApiError(409, "Job with this code already exists");
  }

  const job = await Job.create({
    title,
    code,
    description,
    hiringManager,
    createdBy: req.user?.id,
  });

  res.status(201).json(job);
}

// GET /api/recruitment/jobs
export async function listJobs(_req: Request, res: Response) {
  const jobs = await Job.find().sort({ createdAt: -1 }).lean();
  res.json(jobs);
}

// GET /api/recruitment/jobs/:id
export async function getJob(req: Request, res: Response) {
  const { id } = req.params;
  const job = await Job.findById(id).lean();
  if (!job) {
    throw ApiError.notFound("Job not found");
  }
  res.json(job);
}

/** ----------------- CANDIDATES ----------------- */

// POST /api/recruitment/candidates
export async function createCandidate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      firstName,
      middleName,
      lastName,
      vacancyId,
      email,
      contactNumber,
      keywords,
      dateOfApplication,
      notes,
      consentToKeepData,
    } = req.body as {
      firstName?: string;
      middleName?: string;
      lastName?: string;
      vacancyId?: string;
      email?: string;
      contactNumber?: string;
      keywords?: string; // comma separated
      dateOfApplication?: string; // YYYY-MM-DD
      notes?: string;
      consentToKeepData?: string | boolean;
    };

    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ message: "First name is required" });
    }
    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ message: "Last name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    let vacancy: mongoose.Types.ObjectId | undefined;
    if (vacancyId) {
      if (!mongoose.isValidObjectId(vacancyId)) {
        return res.status(400).json({ message: "Invalid vacancyId" });
      }
      const vac = await Vacancy.findById(vacancyId).select("_id");
      if (!vac) return res.status(404).json({ message: "Vacancy not found" });
      vacancy = vac._id as mongoose.Types.ObjectId;
    }

    const keywordsArr =
      typeof keywords === "string" && keywords.trim().length > 0
        ? keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : [];

    const consent =
      typeof consentToKeepData === "string"
        ? consentToKeepData === "true" || consentToKeepData === "on"
        : Boolean(consentToKeepData);

    const date =
      dateOfApplication && dateOfApplication.length > 0
        ? new Date(dateOfApplication)
        : new Date();

    let resume;
    if (req.file) {
      const basePath = "/uploads/resumes";
      resume = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `${basePath}/${req.file.filename}`,
      };
    }

    const candidate = await Candidate.create({
      firstName: firstName.trim(),
      middleName: middleName?.trim(),
      lastName: lastName.trim(),
      vacancy,
      email: email.trim(),
      contactNumber: contactNumber?.trim(),
      keywords: keywordsArr,
      dateOfApplication: date,
      notes: notes?.trim(),
      consentToKeepData: consent,
      resume,
      status: "APPLIED",
      // ✅ interviewDate/tempEmployeeCode/employeeCode will be added later
    });

    const populated = await candidate.populate([
      { path: "vacancy", select: "name" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

// GET /api/recruitment/candidates
export async function listCandidates(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const items = await Candidate.find()
      .populate("vacancy", "name")
      .sort({ createdAt: -1 })
      .lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

// ✅ GET /api/recruitment/candidates/interviewed?tempCode=TMP-...&status=INTERVIEW|SELECTED|HIRED
export async function listInterviewedCandidates(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tempCode = String(req.query.tempCode || "").trim();
    const status = String(req.query.status || "")
      .trim()
      .toUpperCase();

    const allowedStatus = new Set(["INTERVIEW", "SELECTED", "HIRED"]);

    const query: any = {
      // Interviewed = has interviewDate OR status in INTERVIEW/SELECTED/HIRED
      $or: [
        { interviewDate: { $exists: true, $ne: null } },
        { status: { $in: ["INTERVIEW", "SELECTED", "HIRED"] } },
      ],
    };

    if (tempCode) {
      query.tempEmployeeCode = { $regex: tempCode, $options: "i" };
    }

    if (status && allowedStatus.has(status)) {
      query.status = status;
    }

    const items = await Candidate.find(query)
      .populate("vacancy", "name")
      .sort({ interviewDate: -1, createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    next(err);
  }
}

// ✅ GET /api/recruitment/candidates/:id
export async function getCandidateById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid candidate id" });
    }

    const candidate = await Candidate.findById(id)
      .populate("vacancy", "name")
      .lean();

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(candidate);
  } catch (err) {
    next(err);
  }
}

/**
 * ✅ PATCH /api/recruitment/candidates/:id/interview
 * body: { interviewDate: "YYYY-MM-DD" }
 *
 * - sets interviewDate
 * - generates tempEmployeeCode if missing
 * - if candidate already SELECTED/HIRED and employeeCode missing -> generate it
 */
export async function setInterviewDate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { interviewDate } = req.body as { interviewDate?: string };

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid candidate id" });
    }
    if (!interviewDate) {
      return res.status(400).json({ message: "interviewDate is required" });
    }

    const d = new Date(interviewDate);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ message: "Invalid interviewDate" });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.interviewDate = d;

    if (!candidate.tempEmployeeCode) {
      candidate.tempEmployeeCode = await generateTempEmployeeCode(d);
    }

    if (
      (candidate.status === "SELECTED" || candidate.status === "HIRED") &&
      !candidate.employeeCode
    ) {
      candidate.employeeCode = await generateEmployeeCode(d);
    }

    await candidate.save();

    // ✅ notify hiring manager (if mapped)
    if (candidate.vacancy) {
      const vac = await Vacancy.findById(candidate.vacancy)
        .populate("job", "title code")
        .lean();

      const hmEmail =
        (vac as any)?.hiringManagerEmail?.toLowerCase?.()?.trim?.() || "";
      if (hmEmail) {
        const hmUser = await User.findOne({
          $or: [{ email: hmEmail }, { username: hmEmail }],
        }).lean();

        if (hmUser?._id) {
          const candidateName =
            `${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`.trim();
          const jobTitle = (vac as any)?.job?.title ?? "";
          const vacancyName = (vac as any)?.name ?? "";
          const when = d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          await createNotification({
            userId: String(hmUser._id),
            type: "RECRUITMENT",
            title: "Interview Scheduled",
            message: `${candidateName} interview scheduled on ${when} for ${vacancyName}${jobTitle ? ` (${jobTitle})` : ""}.`,
            link: `/recruitment/candidates/${candidate._id}`,
            meta: {
              candidateId: String(candidate._id),
              candidateEmail: candidate.email,
              vacancyId: String((vac as any)?._id ?? ""),
              vacancyName,
              jobTitle,
              interviewDate: d.toISOString(),
            },
          });
        }
      }
    }

    const populated = await Candidate.findById(id)
      .populate("vacancy", "name")
      .lean();

    res.json(populated);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/recruitment/candidates/:id/status
export async function updateCandidateStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid candidate id" });
    }
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // ✅ If converting to SELECTED/HIRED, interviewDate is mandatory
    const converting = status === "SELECTED" || status === "HIRED";
    if (converting && !candidate.interviewDate) {
      return res.status(400).json({
        message: "Interview date must be set before selecting/hiring candidate",
      });
    }

    candidate.status = status as any;

    // ✅ Ensure temp code exists once interview date exists
    if (candidate.interviewDate && !candidate.tempEmployeeCode) {
      candidate.tempEmployeeCode = await generateTempEmployeeCode(
        candidate.interviewDate,
      );
    }

    // ✅ Convert to employee code on SELECTED/HIRED
    if (converting && candidate.interviewDate && !candidate.employeeCode) {
      candidate.employeeCode = await generateEmployeeCode(
        candidate.interviewDate,
      );
    }

    await candidate.save();

    const populated = await Candidate.findById(id)
      .populate("vacancy", "name")
      .lean();

    res.json(populated);
  } catch (err) {
    next(err);
  }
}
