// backend/src/modules/recruitment/recruitment.controller.ts
import { Request, Response } from "express";
import { Job } from "./job.model";
import { Candidate } from "./candidate.model";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ApiError } from "../../utils/ApiError";

// JOBS

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

// CANDIDATES

// POST /api/recruitment/candidates
export async function createCandidate(req: Request, res: Response) {
  const { firstName, lastName, email, phone, jobId, resumeUrl, notes } =
    req.body;

  if (!firstName || !lastName || !email || !jobId) {
    throw ApiError.badRequest(
      "firstName, lastName, email and jobId are required"
    );
  }

  const candidate = await Candidate.create({
    firstName,
    lastName,
    email,
    phone,
    job: jobId,
    resumeUrl,
    notes,
  });

  res.status(201).json(candidate);
}

// GET /api/recruitment/candidates
export async function listCandidates(req: Request, res: Response) {
  const { jobId } = req.query;

  const filter: any = {};
  if (jobId) {
    filter.job = jobId;
  }

  const candidates = await Candidate.find(filter)
    .populate("job")
    .sort({ createdAt: -1 })
    .lean();

  res.json(candidates);
}

// PATCH /api/recruitment/candidates/:id/status
export async function updateCandidateStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = [
    "APPLIED",
    "SHORTLISTED",
    "INTERVIEW",
    "OFFERED",
    "HIRED",
    "REJECTED",
  ];

  if (!allowed.includes(status)) {
    throw ApiError.badRequest("Invalid candidate status");
  }

  const candidate = await Candidate.findById(id).exec();
  if (!candidate) {
    throw ApiError.notFound("Candidate not found");
  }

  candidate.status = status;
  await candidate.save();

  res.json(candidate);
}
