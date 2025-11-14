// backend/src/modules/performance/performance.controller.ts
import { Request, Response } from "express";
import { PerformanceReview } from "./performance.model";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ApiError } from "../../utils/ApiError";

export async function createPerformanceReview(
  req: AuthRequest,
  res: Response
) {
  const { employeeId, reviewerId, periodStart, periodEnd, rating, comments } =
    req.body;

  if (!employeeId || !reviewerId || !periodStart || !periodEnd || !rating) {
    throw ApiError.badRequest(
      "employeeId, reviewerId, periodStart, periodEnd, rating are required"
    );
  }

  const review = await PerformanceReview.create({
    employee: employeeId,
    reviewer: reviewerId,
    periodStart,
    periodEnd,
    rating,
    comments,
    status: "DRAFT",
  });

  res.status(201).json(review);
}

export async function listPerformanceReviews(
  _req: Request,
  res: Response
) {
  const reviews = await PerformanceReview.find()
    .populate("employee")
    .populate("reviewer")
    .sort({ createdAt: -1 })
    .lean();

  res.json(reviews);
}

export async function listEmployeeReviews(req: Request, res: Response) {
  const { employeeId } = req.params;
  const reviews = await PerformanceReview.find({ employee: employeeId })
    .populate("reviewer")
    .sort({ createdAt: -1 })
    .lean();

  res.json(reviews);
}

export async function updateReviewStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  if (!["DRAFT", "SUBMITTED", "APPROVED"].includes(status)) {
    throw ApiError.badRequest("Invalid status");
  }

  const review = await PerformanceReview.findById(id).exec();
  if (!review) {
    throw ApiError.notFound("Performance review not found");
  }

  review.status = status;
  await review.save();

  res.json(review);
}
