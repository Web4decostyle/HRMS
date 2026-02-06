import multer from "multer";
import path from "path";
import fs from "fs";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

const storage = multer.diskStorage({
  destination: (req: any, _file, cb) => {
    const employeeId = String(req.params.employeeId || "unknown");
    const dir = path.join(process.cwd(), "uploads", "employee-attachments", employeeId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const stamp = Date.now();
    cb(null, `${stamp}-${safeName(file.originalname)}`);
  },
});

export const employeeAttachmentUpload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});
