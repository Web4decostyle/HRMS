import { Request, Response } from "express";
import { parse } from "csv-parse/sync";
import PimImportHistory from "../models/pimImportHistory.model";
import { Employee } from "../../../employees/employee.model";
import { Counter } from "../models/counter.model";

type MulterRequest = Request & { file?: any };

const normalizeHeader = (h: string) =>
  h
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

async function nextEmployeeId(prefix = "EMP", pad = 4) {
  const c = await Counter.findOneAndUpdate(
    { key: "employeeId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const num = String(c.seq).padStart(pad, "0");
  return `${prefix}${num}`;
}

export async function downloadPimSampleCsv(req: Request, res: Response) {
  const sample = [
    "employeeId,firstName,lastName,email,jobTitle,department,status,dateOfBirth,gender,maritalStatus,nationality",
    "EMP0001,John,Doe,john.doe@example.com,Software Engineer,IT,ACTIVE,1990-01-01,MALE,single,Indian",
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="pim_import_sample.csv"');
  res.send(sample);
}

export async function importEmployeesCsv(req: MulterRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "File is required" });
  }

  const fileName = req.file.originalname;

  const history = await PimImportHistory.create({
    fileName,
    status: "PENDING",
    totalRecords: 0,
    processedRecords: 0,
  });

  try {
    const csvText = req.file.buffer.toString("utf8");

    // ✅ normalize headers so "Employee Id" / "employee_id" also works
    const records: any[] = parse(csvText, {
      columns: (headers: string[]) => headers.map(normalizeHeader),
      skip_empty_lines: true,
      trim: true,
    });

    const results: any[] = [];
    let success = 0;
    let failed = 0;

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // assuming row1 is header

      try {
        const firstName = row.firstname;
        const lastName = row.lastname;

        if (!firstName || !lastName) {
          failed++;
          results.push({
            row: rowNumber,
            status: "error",
            errors: ["firstName and lastName are required"],
            data: row,
          });
          continue;
        }

        // ✅ employeeId optional now
        const employeeId = row.employeeid || (await nextEmployeeId());

        const status =
          String(row.status || "")
            .toUpperCase()
            .trim() === "INACTIVE"
            ? "INACTIVE"
            : "ACTIVE";

        const genderRaw = String(row.gender || "").toUpperCase().trim();
        const gender =
          genderRaw === "FEMALE" ? "FEMALE" : genderRaw === "MALE" ? "MALE" : undefined;

        const dob = row.dateofbirth ? new Date(row.dateofbirth) : undefined;

        // ✅ email optional: generate safe placeholder if empty
        const email =
          row.email?.trim() ||
          `${employeeId.toLowerCase()}@import.local`;

        await Employee.findOneAndUpdate(
          { employeeId },
          {
            employeeId,
            firstName,
            lastName,
            email,
            jobTitle: row.jobtitle,
            department: row.department,
            status,
            ...(dob ? { dateOfBirth: dob } : {}),
            ...(gender ? { gender } : {}),
            maritalStatus: row.maritalstatus,
            nationality: row.nationality,
          },
          { upsert: true, setDefaultsOnInsert: true }
        );

        success++;
        results.push({ row: rowNumber, status: "success", data: row });
      } catch (e: any) {
        failed++;
        results.push({
          row: rowNumber,
          status: "error",
          errors: [e?.message || "Row import failed"],
          data: row,
        });
      }
    }

    history.status = "COMPLETED";
    history.totalRecords = records.length;
    history.processedRecords = success;
    await history.save();

    return res.json({
      success: true,
      message: `Imported ${success}/${records.length}`,
      summary: { total: records.length, success, failed },
      results,
    });
  } catch (err) {
    console.error("PIM import error:", err);
    history.status = "PENDING";
    await history.save();
    return res.status(500).json({ success: false, message: "Import failed" });
  }
}
