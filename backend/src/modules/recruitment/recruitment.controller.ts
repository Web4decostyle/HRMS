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
  next: NextFunction
) {
  try {
    const {
      firstName,
      middleName,
      lastName,
      vacancyId,
      email,
      mobileNumber,
      contactNumber,
      aadharNumber,
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
      mobileNumber?: string;
      contactNumber?: string;
      aadharNumber?: string;
      keywords?: string;
      dateOfApplication?: string;
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
    if (!mobileNumber || !mobileNumber.trim()) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    let vacancy: mongoose.Types.ObjectId | undefined;
    if (vacancyId) {
      if (!mongoose.isValidObjectId(vacancyId)) {
        return res.status(400).json({ message: "Invalid vacancyId" });
      }
      const vac = await Vacancy.findById(vacancyId).select("_id");
      if (!vac) {
        return res.status(404).json({ message: "Vacancy not found" });
      }
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
    if ((req as any).file) {
      const file = (req as any).file;
      const basePath = "/uploads/resumes";
      resume = {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `${basePath}/${file.filename}`,
      };
    }

    const candidate = await Candidate.create({
      firstName: firstName.trim(),
      middleName: middleName?.trim(),
      lastName: lastName.trim(),
      vacancy,
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      contactNumber: contactNumber?.trim(),
      aadharNumber: aadharNumber?.trim(),
      keywords: keywordsArr,
      dateOfApplication: date,
      notes: notes?.trim(),
      consentToKeepData: consent,
      resume,
      status: "APPLIED",
    });

    const populated = await candidate.populate([{ path: "vacancy", select: "name" }]);

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

// GET /api/recruitment/candidates
export async function listCandidates(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      jobId,
      status,
      searchBy,
      search,
      dateFrom,
      dateTo,
    } = req.query as {
      jobId?: string;
      status?: string;
      searchBy?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
    };

    const query: any = {};

    if (status && status.trim()) {
      query.status = status.trim().toUpperCase();
    }

    if (jobId && mongoose.isValidObjectId(jobId)) {
      const vacancyIds = await Vacancy.find({ job: jobId }).distinct("_id");
      query.vacancy = { $in: vacancyIds };
    }

    if (search && search.trim()) {
      const q = search.trim();

      if (searchBy === "aadhar") {
        query.aadharNumber = { $regex: q, $options: "i" };
      } else if (searchBy === "mobile") {
        query.$or = [
          { mobileNumber: { $regex: q, $options: "i" } },
          { contactNumber: { $regex: q, $options: "i" } },
        ];
      } else {
        query.$or = [
          { firstName: { $regex: q, $options: "i" } },
          { middleName: { $regex: q, $options: "i" } },
          { lastName: { $regex: q, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: {
                  $trim: {
                    input: {
                      $concat: [
                        { $ifNull: ["$firstName", ""] },
                        " ",
                        { $ifNull: ["$middleName", ""] },
                        " ",
                        { $ifNull: ["$lastName", ""] },
                      ],
                    },
                  },
                },
                regex: q,
                options: "i",
              },
            },
          },
        ];
      }
    }

    if (dateFrom || dateTo) {
      query.dateOfApplication = {};

      if (dateFrom) {
        const from = new Date(dateFrom);
        if (!Number.isNaN(from.getTime())) {
          query.dateOfApplication.$gte = from;
        }
      }

      if (dateTo) {
        const to = new Date(dateTo);
        if (!Number.isNaN(to.getTime())) {
          to.setHours(23, 59, 59, 999);
          query.dateOfApplication.$lte = to;
        }
      }

      if (Object.keys(query.dateOfApplication).length === 0) {
        delete query.dateOfApplication;
      }
    }

    const items = await Candidate.find(query)
      .populate({
        path: "vacancy",
        select: "name job",
        populate: { path: "job", select: "title name code" },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    next(err);
  }
}

// GET /api/recruitment/candidates/interviewed
export async function listInterviewedCandidates(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tempCode = String(req.query.tempCode || "").trim();
    const status = String(req.query.status || "")
      .trim()
      .toUpperCase();

    const allowedStatus = new Set(["INTERVIEW", "SELECTED", "HIRED"]);

    const query: any = {
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

// GET /api/recruitment/candidates/:id
export async function getCandidateById(
  req: Request,
  res: Response,
  next: NextFunction
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
 * PATCH /api/recruitment/candidates/:id/interview
 * body: { interviewDate: "YYYY-MM-DD" }
 */
export async function setInterviewDate(
  req: Request,
  res: Response,
  next: NextFunction
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
  next: NextFunction
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

    const converting = status === "SELECTED" || status === "HIRED";
    if (converting && !candidate.interviewDate) {
      return res.status(400).json({
        message: "Interview date must be set before selecting/hiring candidate",
      });
    }

    candidate.status = status as any;

    if (candidate.interviewDate && !candidate.tempEmployeeCode) {
      candidate.tempEmployeeCode = await generateTempEmployeeCode(
        candidate.interviewDate
      );
    }

    if (converting && candidate.interviewDate && !candidate.employeeCode) {
      candidate.employeeCode = await generateEmployeeCode(
        candidate.interviewDate
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