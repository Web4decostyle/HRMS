// backend/src/modules/performance/performance.controllers.ts
import { Request, Response } from "express";
import {
  PerformanceKpi,
  PerformanceTracker,
  PerformanceReview,
  ReviewStatus,
} from "./performance.model";
import { Types } from "mongoose";

/* Helper to parse date filters safely */
const toDateOrUndefined = (val: any): Date | undefined => {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
};

/* ================================
   KPIs
================================ */

export const listKpis = async (req: Request, res: Response) => {
  try {
    const { jobTitle } = req.query;

    const filter: any = {};
    if (jobTitle && typeof jobTitle === "string" && jobTitle.trim()) {
      filter.jobTitle = jobTitle.trim();
    }

    const kpis = await PerformanceKpi.find(filter).sort({
      jobTitle: 1,
      kpiTitle: 1,
    });

    res.json(kpis);
  } catch (err) {
    console.error("listKpis error", err);
    res.status(500).json({ message: "Failed to load KPIs" });
  }
};

export const createKpi = async (req: Request, res: Response) => {
  try {
    const { jobTitle, kpiTitle, minRate, maxRate, isDefault } = req.body;

    if (!jobTitle || !kpiTitle) {
      return res.status(400).json({ message: "jobTitle and kpiTitle required" });
    }

    const kpi = await PerformanceKpi.create({
      jobTitle,
      kpiTitle,
      minRate: Number(minRate ?? 0),
      maxRate: Number(maxRate ?? 5),
      isDefault: !!isDefault,
    });

    res.status(201).json(kpi);
  } catch (err) {
    console.error("createKpi error", err);
    res.status(500).json({ message: "Failed to create KPI" });
  }
};

export const updateKpi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const kpi = await PerformanceKpi.findByIdAndUpdate(
      id,
      {
        jobTitle: req.body.jobTitle,
        kpiTitle: req.body.kpiTitle,
        minRate: req.body.minRate,
        maxRate: req.body.maxRate,
        isDefault: req.body.isDefault,
        isActive: req.body.isActive,
      },
      { new: true }
    );

    if (!kpi) return res.status(404).json({ message: "KPI not found" });
    res.json(kpi);
  } catch (err) {
    console.error("updateKpi error", err);
    res.status(500).json({ message: "Failed to update KPI" });
  }
};

export const deleteKpi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const kpi = await PerformanceKpi.findByIdAndDelete(id);
    if (!kpi) return res.status(404).json({ message: "KPI not found" });
    res.json({ message: "KPI deleted" });
  } catch (err) {
    console.error("deleteKpi error", err);
    res.status(500).json({ message: "Failed to delete KPI" });
  }
};

/* ================================
   Trackers (Configure / My Trackers / Employee Trackers)
================================ */

export const listTrackers = async (req: Request, res: Response) => {
  try {
    const { employeeId, reviewerId, name } = req.query;

    const filter: any = {};
    if (employeeId && typeof employeeId === "string") {
      filter.employee = new Types.ObjectId(employeeId);
    }
    if (reviewerId && typeof reviewerId === "string") {
      filter.reviewers = new Types.ObjectId(reviewerId);
    }
    if (name && typeof name === "string" && name.trim()) {
      filter.name = { $regex: name.trim(), $options: "i" };
    }

    const trackers = await PerformanceTracker.find(filter)
      .populate("employee", "firstName lastName employeeId jobTitle department")
      .populate("reviewers", "firstName lastName employeeId jobTitle")
      .sort({ createdAt: -1 });

    res.json(trackers);
  } catch (err) {
    console.error("listTrackers error", err);
    res.status(500).json({ message: "Failed to load trackers" });
  }
};

export const createTracker = async (req: Request, res: Response) => {
  try {
    const { name, employee, reviewers } = req.body;

    if (!name || !employee) {
      return res
        .status(400)
        .json({ message: "name and employee are required" });
    }

    const tracker = await PerformanceTracker.create({
      name,
      employee,
      reviewers: reviewers ?? [],
    });

    res.status(201).json(tracker);
  } catch (err) {
    console.error("createTracker error", err);
    res.status(500).json({ message: "Failed to create tracker" });
  }
};

export const updateTracker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tracker = await PerformanceTracker.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        employee: req.body.employee,
        reviewers: req.body.reviewers,
        isActive: req.body.isActive,
      },
      { new: true }
    );

    if (!tracker) {
      return res.status(404).json({ message: "Tracker not found" });
    }

    res.json(tracker);
  } catch (err) {
    console.error("updateTracker error", err);
    res.status(500).json({ message: "Failed to update tracker" });
  }
};

export const deleteTracker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tracker = await PerformanceTracker.findByIdAndDelete(id);
    if (!tracker) {
      return res.status(404).json({ message: "Tracker not found" });
    }
    res.json({ message: "Tracker deleted" });
  } catch (err) {
    console.error("deleteTracker error", err);
    res.status(500).json({ message: "Failed to delete tracker" });
  }
};

/** "My Trackers" – trackers where logged-in user is in reviewers[] */
export const listMyTrackers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id as string; // adapt to your auth
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const trackers = await PerformanceTracker.find({
      reviewers: new Types.ObjectId(userId),
      isActive: true,
    })
      .populate("employee", "firstName lastName employeeId jobTitle")
      .sort({ createdAt: -1 });

    res.json(trackers);
  } catch (err) {
    console.error("listMyTrackers error", err);
    res.status(500).json({ message: "Failed to load trackers" });
  }
};

/** "Employee Trackers" – trackers for the logged-in employee as subject */
export const listEmployeeTrackers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const trackers = await PerformanceTracker.find({
      employee: new Types.ObjectId(userId),
      isActive: true,
    })
      .populate("reviewers", "firstName lastName employeeId jobTitle")
      .sort({ createdAt: -1 });

    res.json(trackers);
  } catch (err) {
    console.error("listEmployeeTrackers error", err);
    res.status(500).json({ message: "Failed to load trackers" });
  }
};

/* ================================
   Reviews (Manage / My / Employee)
================================ */


export const listReviews = async (req: Request, res: Response) => {
  try {
    const {
      jobTitle,
      subUnit,
      status,
      fromDate,
      toDate,
      employeeId,
    } = req.query;

    const filter: any = {};

    if (jobTitle && typeof jobTitle === "string") filter.jobTitle = jobTitle;
    if (subUnit && typeof subUnit === "string") filter.subUnit = subUnit;
    if (status && typeof status === "string") filter.status = status;

    if (employeeId && typeof employeeId === "string") {
      filter.employee = new Types.ObjectId(employeeId);
    }

    const from = toDateOrUndefined(fromDate);
    const to = toDateOrUndefined(toDate);

    if (from || to) {
      filter.periodFrom = {};
      if (from) filter.periodFrom.$gte = from;
      if (to) filter.periodFrom.$lte = to;
    }

    const reviews = await PerformanceReview.find(filter)
      .populate("employee", "firstName lastName employeeId jobTitle department")
      .populate("reviewer", "firstName lastName employeeId jobTitle")
      .sort({ dueDate: 1 });

    res.json(reviews);
  } catch (err) {
    console.error("listReviews error", err);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const review = await PerformanceReview.findById(req.params.id)
      .populate("employee", "firstName lastName employeeId jobTitle department")
      .populate("reviewer", "firstName lastName employeeId jobTitle")
      .populate("additionalReviewers", "firstName lastName employeeId jobTitle")
      .populate("kpiRatings.kpi");

    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    console.error("getReviewById error", err);
    res.status(500).json({ message: "Failed to load review" });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const {
      employee,
      reviewer,
      additionalReviewers,
      jobTitle,
      subUnit,
      periodFrom,
      periodTo,
      dueDate,
      status,
      kpiRatings,
    } = req.body;

    if (!employee || !reviewer || !jobTitle || !periodFrom || !periodTo || !dueDate) {
      return res.status(400).json({
        message: "employee, reviewer, jobTitle, periodFrom, periodTo, dueDate are required",
      });
    }

    const review = await PerformanceReview.create({
      employee,
      reviewer,
      additionalReviewers: additionalReviewers ?? [],
      jobTitle,
      subUnit,
      periodFrom,
      periodTo,
      dueDate,
      status: (status as ReviewStatus) || "NOT_STARTED",
      kpiRatings: kpiRatings ?? [],
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("createReview error", err);
    res.status(500).json({ message: "Failed to create review" });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      employee,
      reviewer,
      additionalReviewers,
      jobTitle,
      subUnit,
      periodFrom,
      periodTo,
      dueDate,
      status,
      kpiRatings,
      overallRating,
    } = req.body;

    const review = await PerformanceReview.findByIdAndUpdate(
      id,
      {
        employee,
        reviewer,
        additionalReviewers,
        jobTitle,
        subUnit,
        periodFrom,
        periodTo,
        dueDate,
        status,
        kpiRatings,
        overallRating,
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(review);
  } catch (err) {
    console.error("updateReview error", err);
    res.status(500).json({ message: "Failed to update review" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await PerformanceReview.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("deleteReview error", err);
    res.status(500).json({ message: "Failed to delete review" });
  }
};

/* My Reviews – reviews where logged-in user is the EMPLOYEE being reviewed */
export const listMyReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id as string;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const reviews = await PerformanceReview.find({
      employee: new Types.ObjectId(userId),
    })
      .populate("reviewer", "firstName lastName employeeId jobTitle")
      .sort({ dueDate: 1 });

    res.json(reviews);
  } catch (err) {
    console.error("listMyReviews error", err);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

/* Employee Reviews – reviews where logged-in user is a REVIEWER */
export const listEmployeeReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id as string;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const id = new Types.ObjectId(userId);

    const reviews = await PerformanceReview.find({
      $or: [{ reviewer: id }, { additionalReviewers: id }],
    })
      .populate("employee", "firstName lastName employeeId jobTitle department")
      .sort({ dueDate: 1 });

    res.json(reviews);
  } catch (err) {
    console.error("listEmployeeReviews error", err);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};
