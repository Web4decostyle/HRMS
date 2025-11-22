// backend/src/modules/admin/config/emailConfig.controller.ts
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { EmailConfig } from "./emailConfig.model";
import { ApiError } from "../../../utils/ApiError";

/* =======================
   GET EMAIL CONFIG
======================= */
export async function getEmailConfig(_req: Request, res: Response) {
  const config = await EmailConfig.findOne().lean();
  res.json(config || null);
}

/* =======================
   SAVE / UPDATE EMAIL CONFIG
======================= */
export async function saveEmailConfig(req: Request, res: Response) {
  const payload = req.body;

  let config = await EmailConfig.findOne();
  if (!config) {
    config = new EmailConfig(payload);
  } else {
    Object.assign(config, payload);
  }

  await config.save();
  res.json({ message: "Email configuration saved", config });
}

/* =======================
   SEND TEST MAIL
======================= */
export async function sendTestMail(req: Request, res: Response) {
  const { to } = req.body;
  if (!to) throw ApiError.badRequest("Receiver email required");

  const config = await EmailConfig.findOne();
  if (!config) throw ApiError.badRequest("Email settings not configured");

  const secure = config.sendingMethod === "SECURE_SMTP";

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure,
    auth: config.useAuth
      ? { user: config.smtpUser, pass: config.smtpPassword }
      : undefined,
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.sendMail({
      from: config.mailSentAs,
      to,
      subject: "Test Email - HRMS",
      text: "This is a test email from HRMS",
    });

    res.json({ message: "Test mail sent successfully" });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Unknown error while sending email";
    // 500 = Internal Server Error
    throw new ApiError(500, `Failed to send email: ${msg}`);
  }
}
