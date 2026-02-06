import { Request, Response } from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import { ApiError } from "../../utils/ApiError";
import { Employee } from "./employee.model";
import { EmployeeAttachment } from "./employeeAttachment.model";

function toObjectId(id: unknown): mongoose.Types.ObjectId {
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  throw ApiError.badRequest("Invalid ObjectId");
}

export async function listEmployeeAttachments(req: Request, res: Response) {
  const employeeId = toObjectId(req.params.employeeId);

  // Ensure employee exists
  const emp = await Employee.findById(employeeId).select("_id").lean();
  if (!emp) throw ApiError.notFound("Employee not found");

  const rows = await EmployeeAttachment.find({ employeeId })
    .sort({ createdAt: -1 })
    .populate("addedBy", "username email")
    .lean();

  // Frontend expects: filename, description, size, mimeType, dateAdded, addedBy?.name
  const mapped = rows.map((r: any) => ({
    _id: r._id,
    filename: r.originalName, // show original name in UI
    description: r.description || "",
    size: r.size,
    mimeType: r.mimeType,
    dateAdded: r.createdAt,
    addedBy: r.addedBy
      ? { name: r.addedBy.username || r.addedBy.email || "User" }
      : { name: "" },
    url: r.url,
  }));

  res.json(mapped);
}

export async function uploadEmployeeAttachment(req: any, res: Response) {
  const employeeId = toObjectId(req.params.employeeId);

  const emp = await Employee.findById(employeeId).select("_id").lean();
  if (!emp) throw ApiError.notFound("Employee not found");

  const file = req.file;
  if (!file) throw ApiError.badRequest("File is required");

  const description = String(req.body?.description || "").trim() || undefined;
  const addedBy = req.user?.id ? toObjectId(req.user.id) : null;

  const doc = await EmployeeAttachment.create({
    employeeId,
    originalName: file.originalname,
    filename: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    description,
    url: `/uploads/employee-attachments/${String(employeeId)}/${file.filename}`,
    addedBy,
  });

  res.status(201).json({
    success: true,
    attachment: {
      _id: doc._id,
      filename: doc.originalName,
      description: doc.description || "",
      size: doc.size,
      mimeType: doc.mimeType,
      dateAdded: doc.createdAt,
      addedBy: { name: "" },
      url: doc.url,
    },
  });
}

export async function deleteEmployeeAttachment(req: Request, res: Response) {
  const employeeId = toObjectId(req.params.employeeId);
  const attachmentId = toObjectId(req.params.attachmentId);

  const att = await EmployeeAttachment.findOne({ _id: attachmentId, employeeId }).lean();
  if (!att) throw ApiError.notFound("Attachment not found");

  // Try removing file from disk (ignore if missing)
  try {
    const rel = att.url.replace(/^\/uploads\//, "");
    const absPath = path.join(process.cwd(), "uploads", rel);
    fs.unlinkSync(absPath);
  } catch {
    // ignore
  }

  await EmployeeAttachment.deleteOne({ _id: attachmentId, employeeId });

  res.json({ success: true });
}
