// server/src/routes/pimImport.ts
import express from "express";
import multer from "multer";
import { parse } from "csv-parse";
import dayjs from "dayjs";
import { PassThrough } from "stream";
import Employee from "../models/Employee";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1 * 1024 * 1024 } }); // 1MB

function normalizeGender(g?: string) {
  if (!g) return undefined;
  const v = String(g).trim().toLowerCase();
  if (["m", "male"].includes(v)) return "Male";
  if (["f", "female"].includes(v)) return "Female";
  return undefined;
}

// POST /api/pim/import
router.post("/import", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const parser = parse({
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const results: Array<any> = [];
  const batch: Array<{ doc: any; row: number }> = [];
  const BATCH_SIZE = 100;
  let rowIndex = 0;
  const parseErrors: string[] = [];

  const bufferStream = new PassThrough();
  bufferStream.end(req.file.buffer);
  bufferStream.pipe(parser);

  parser.on("readable", () => {
    let record;
    while ((record = parser.read())) {
      rowIndex++;
      // map known header names (be forgiving)
      const firstName = record["First Name"] ?? record["firstName"] ?? record["first_name"];
      const lastName = record["Last Name"] ?? record["lastName"] ?? record["last_name"];
      const email = record["Email"] ?? record["email"];
      const gender = normalizeGender(record["Gender"] ?? record["gender"]);
      const dobRaw = record["Date of Birth"] ?? record["dob"] ?? record["DOB"];
      const employeeId = record["Employee Id"] ?? record["employeeId"] ?? record["employee_id"];
      const phone = record["Phone"] ?? record["phone"];
      const department = record["Department"] ?? record["department"];
      const jobTitle = record["Job Title"] ?? record["jobTitle"];
      const location = record["Location"] ?? record["location"];

      const rowErrors: string[] = [];
      if (!firstName || !String(firstName).trim()) rowErrors.push("First name required");
      if (!lastName || !String(lastName).trim()) rowErrors.push("Last name required");

      // DOB parse
      let dob = null;
      if (dobRaw) {
        const d = dayjs(dobRaw, "YYYY-MM-DD", true);
        if (!d.isValid()) rowErrors.push("DOB must be YYYY-MM-DD");
        else dob = d.toDate();
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
        rowErrors.push("Invalid email");
      }

      if (rowErrors.length) {
        results.push({ row: rowIndex, status: "error", errors: rowErrors, data: record });
        continue;
      }

      const doc = {
        employeeId: employeeId ? String(employeeId).trim() : undefined,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        email: email ? String(email).trim().toLowerCase() : undefined,
        gender,
        dob,
        phone: phone ? String(phone).trim() : undefined,
        department: department ? String(department).trim() : undefined,
        jobTitle: jobTitle ? String(jobTitle).trim() : undefined,
        location: location ? String(location).trim() : undefined,
      };

      batch.push({ doc, row: rowIndex });

      if (batch.length >= BATCH_SIZE) {
        // flush batch
        try {
          const ops = batch.map((b) => {
            // upsert by employeeId if provided else by email if provided else insert
            const filter: any = {};
            if (b.doc.employeeId) filter.employeeId = b.doc.employeeId;
            else if (b.doc.email) filter.email = b.doc.email;
            else return { insertOne: { document: b.doc } };

            return {
              updateOne: {
                filter,
                update: { $setOnInsert: b.doc },
                upsert: true,
              },
            };
          });

          if (ops.length) {
            // bulkWrite may throw for some failures — catch below
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await Employee.bulkWrite(ops, { ordered: false });
            for (const it of batch) results.push({ row: it.row, status: "success", data: it.doc });
          }

        } catch (err: any) {
          for (const it of batch) {
            results.push({ row: it.row, status: "error", errors: [String(err?.message ?? err)], data: it.doc });
          }
        } finally {
          batch.length = 0;
        }
      }
    }
  });

  parser.on("error", (err) => {
    parseErrors.push(String(err.message));
  });

  parser.on("end", async () => {
    try {
      if (batch.length) {
        try {
          const ops = batch.map((b) => {
            const filter: any = {};
            if (b.doc.employeeId) filter.employeeId = b.doc.employeeId;
            else if (b.doc.email) filter.email = b.doc.email;
            else return { insertOne: { document: b.doc } };

            return {
              updateOne: {
                filter,
                update: { $setOnInsert: b.doc },
                upsert: true,
              },
            };
          });

          if (ops.length) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await Employee.bulkWrite(ops, { ordered: false });
            for (const it of batch) results.push({ row: it.row, status: "success", data: it.doc });
          }
        } catch (err: any) {
          for (const it of batch) {
            results.push({ row: it.row, status: "error", errors: [String(err?.message ?? err)], data: it.doc });
          }
        } finally {
          batch.length = 0;
        }
      }

      const summary = {
        total: results.length,
        success: results.filter((r) => r.status === "success").length,
        failed: results.filter((r) => r.status === "error").length,
      };

      return res.json({ message: "Import completed", summary, results, parseErrors });
    } catch (err: any) {
      console.error("Import end error", err);
      return res.status(500).json({ message: "Import failed", error: String(err) });
    }
  });
});


// GET /api/pim/import/sample -> serves a sample CSV
router.get("/import/sample", (req, res) => {
  res.type("text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=sample-pim.csv");
  res.send(
`First Name,Last Name,Email,Gender,Date of Birth,Employee Id,Phone,Department,Job Title,Location
John,Doe,john.doe@example.com,Male,1990-02-01,EMP001,1234567890,Engineering,Developer,Office A
Jane,Smith,jane.smith@example.com,Female,1988-07-15,EMP002,0987654321,HR,Recruiter,Office B
`
  );
});

export default router;