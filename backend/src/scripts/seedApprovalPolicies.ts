import mongoose from "mongoose";
import { ApprovalPolicy } from "../modules/approvals/approvalPolicy.model";
import { connectDB } from "../config/db";

async function seed() {
  await connectDB();

  const policies = [
    "EmergencyContact",
    "Dependent",
    "Education",
    "WorkExperience",
    "Skill",
    "Language",
    "License",
  ].map((entityType) => ({
    module: "PIM",
    entityType,
    steps: [
      { order: 1, role: "SUPERVISOR" },
      { order: 2, role: "HR" },
      { order: 3, role: "ADMIN" },
    ],
  }));

  for (const p of policies) {
    await ApprovalPolicy.updateOne(
      { module: p.module, entityType: p.entityType },
      { $set: p },
      { upsert: true }
    );
  }

  console.log("✅ Approval policies seeded");
  process.exit(0);
}

seed();
