// backend/src/modules/pim/pimImport.controller.ts
import { Request, Response } from "express";
import { parse } from "csv-parse/sync";
import PimImportHistory from "../models/pimImportHistory.model";
import { Employee } from "../../../employees/employee.model";

// Simple extension: just say "file" is any
type MulterRequest = Request & {
  file?: any;
};

// GET /api/pim/import/sample
export async function downloadPimSampleCsv(req: Request, res: Response) {
  const sample = [
    "employeeId,firstName,lastName,email,jobTitle,department,status,dateOfBirth,gender,maritalStatus,nationality",
    "EMP001,John,Doe,john.doe@example.com,Software Engineer,IT,ACTIVE,1990-01-01,MALE,single,Indian",
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="pim_import_sample.csv"'
  );
  res.send(sample);
}

// POST /api/pim/import
export async function importEmployeesCsv(req: MulterRequest, res: Response) {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "File is required" });
  }

  const fileName = req.file.originalname;

  const history = await PimImportHistory.create({
    fileName,
    status: "PENDING",
    totalRecords: 0,
    processedRecords: 0,
  });

  try {
    const csv = req.file.buffer.toString("utf8");

    const records: any[] = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let processed = 0;

    for (const row of records) {
      if (!row.employeeId || !row.firstName || !row.lastName) continue;

      const gender =
        row.gender?.toString().toUpperCase() === "FEMALE" ? "FEMALE" : "MALE";

      const status =
        row.status?.toString().toUpperCase() === "INACTIVE"
          ? "INACTIVE"
          : "ACTIVE";

      const dob = row.dateOfBirth ? new Date(row.dateOfBirth) : undefined;

      await Employee.findOneAndUpdate(
        { employeeId: row.employeeId },
        {
          employeeId: row.employeeId,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          jobTitle: row.jobTitle,
          department: row.department,
          status,
          dateOfBirth: dob,
          gender,
          maritalStatus: row.maritalStatus,
          nationality: row.nationality,
        },
        { upsert: true, setDefaultsOnInsert: true }
      );

      processed++;
    }

    history.status = "COMPLETED";
    history.totalRecords = records.length;
    history.processedRecords = processed;
    await history.save();

    return res.json({
      success: true,
      message: `Imported ${processed} of ${records.length} record(s)`,
    });
  } catch (err) {
    console.error("PIM import error:", err);
    history.status = "PENDING";
    await history.save();
    return res.status(500).json({ success: false, message: "Import failed" });
  }
}
