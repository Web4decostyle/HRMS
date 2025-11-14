// backend/src/modules/maintenance/maintenance.controller.ts
import { Request, Response } from "express";

export async function getSystemInfo(_req: Request, res: Response) {
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage(),
    uptimeSeconds: process.uptime(),
  });
}
