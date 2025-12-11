import multer from "multer";
import path from "path";
import fs from "fs";

const dir = path.join(__dirname, "..", "..", "..", "uploads", "job-specs");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

export const uploadJobSpec = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
});
