import { Router } from "express";
import {
  getEmailConfig,
  saveEmailConfig,
  sendTestMail,
} from "./emailConfig.controller";

const router = Router();

router.get("/", getEmailConfig);
router.post("/", saveEmailConfig);
router.post("/test", sendTestMail);

export default router;
