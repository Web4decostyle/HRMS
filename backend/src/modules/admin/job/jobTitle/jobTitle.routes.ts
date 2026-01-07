import { Router } from "express";
import { listJobTitles, createJobTitle } from "./jobTitle.controller";
import { uploadJobSpec } from "../../../../middleware/uploadJobSpec";
import { requireAuth } from "../../../../middleware/authMiddleware";
import { adminOrRequestChange } from "../../../../middleware/adminOrRequest";

const router = Router();

// ✅ Everyone logged-in can read (Supervisor/ESS/Viewer all ok)
router.get("/", requireAuth, listJobTitles);

// ✅ Admin: creates immediately
// ✅ HR: creates Change Request (202) and waits for Admin approval
// ❌ Others: forbidden
router.post(
  "/",
  requireAuth,
  uploadJobSpec.single("specFile"),
  adminOrRequestChange({
    module: "ADMIN_JOB",
    modelName: "JobTitle",
    action: "CREATE",
    buildPayload: (req) => {
      const body: any = req.body || {};
      const name = (body.name || "").toString().trim();
      const description = (body.description || "").toString().trim();
      const note = (body.note || "").toString().trim();

      const specFilePath = (req as any).file
        ? `/uploads/job-specs/${(req as any).file.filename}`
        : undefined;

      return {
        name,
        description: description || undefined,
        note: note || undefined,
        specFilePath,
      };
    },
  }),
  createJobTitle
);

export default router;
