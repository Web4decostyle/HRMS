import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadImportMutation } from "../../../features/pim/pimConfigApi";

/* ---------------------------------------------
   Types
--------------------------------------------- */

type ImportRowResult = {
  row: number;
  status: "success" | "error";
  errors?: string[];
  data?: Record<string, any>;
};

type UploadResponse = {
  success?: boolean;
  message?: string;
  summary?: { total: number; success: number; failed: number };
  results?: ImportRowResult[];
};

/* ---------------------------------------------
   Helpers
--------------------------------------------- */

function Badge({
  tone,
  children,
}: {
  tone: "success" | "error" | "neutral";
  children: React.ReactNode;
}) {
  const cls =
    tone === "success"
      ? "bg-green-50 text-green-700 border-green-200"
      : tone === "error"
      ? "bg-red-50 text-red-600 border-red-200"
      : "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}

function pickPreview(data?: Record<string, any>) {
  const d = data || {};
  return {
    employeeId: d.employeeid ?? d.employeeId ?? "-",
    firstName: d.firstname ?? d.firstName ?? "-",
    middleName: d.middlename ?? d.middleName ?? "-",
    lastName: d.lastname ?? d.lastName ?? "-",
    email: d.email ?? "-",
    status: d.status ?? "ACTIVE",
  };
}

/* ---------------------------------------------
   Component
--------------------------------------------- */

export default function DataImportPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ImportRowResult[] | null>(null);

  const [uploadImport, { isLoading }] = useUploadImportMutation();

  const sampleUrl = "/api/pim/import/sample";

  /* ---------------------------------------------
     Handlers
  --------------------------------------------- */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setMessage(null);
    setError(null);
    setResults(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setResults(null);

    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = (await uploadImport(fd).unwrap()) as UploadResponse;

      if (res?.summary) {
        setMessage(
          `Imported ${res.summary.success}/${res.summary.total} records • ${res.summary.failed} failed`
        );
      } else {
        setMessage(res?.message ?? "Import completed.");
      }

      setResults(res?.results ?? []);
      setFile(null);
    } catch (err: any) {
      setError(
        err?.data?.message ??
          err?.error ??
          "Failed to upload/import CSV file."
      );
    }
  };

  const downloadFailed = () => {
    if (!results) return;

    const failed = results.filter((r) => r.status === "error");
    if (failed.length === 0) {
      alert("No failed rows.");
      return;
    }

    const header = ["Row", "Errors", "Data"];
    const rows = failed.map((r) => [
      r.row,
      (r.errors || []).join("; "),
      JSON.stringify(r.data || {}),
    ]);

    const csv = [header, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "pim-import-failed.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------------------------------------------
     Render
  --------------------------------------------- */

  return (
    <div className="px-8 py-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">
        PIM / Configuration
      </h1>

      {/* Tabs */}
      <div className="flex gap-2">
        <button className="px-5 py-2 text-sm rounded-full bg-green-500 text-white">
          Configuration
        </button>
        <button
          className="px-5 py-2 text-sm rounded-full bg-white border"
          onClick={() => navigate("/pim")}
        >
          Employee List
        </button>
        <button
          className="px-5 py-2 text-sm rounded-full bg-white border"
          onClick={() => navigate("/employees/add")}
        >
          Add Employee
        </button>
      </div>

      {/* Import Card */}
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-4 border-b font-semibold">Data Import</div>

        <div className="p-6 space-y-5">
          {/* Note */}
          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600">
            <ul className="list-disc pl-5 space-y-1">
              <li>First Name and Last Name are compulsory</li>
              <li>Dates must be in YYYY-MM-DD format</li>
              <li>Gender: Male or Female</li>
              <li>Maximum 100 records per file</li>
              <li>
                Sample CSV:{" "}
                <a href={sampleUrl} className="text-green-500 font-semibold">
                  Download
                </a>
              </li>
            </ul>
          </div>

          {/* Upload */}
          <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
            <label className="text-xs font-semibold">Select File *</label>

            <label className="flex items-center justify-between px-4 py-2 border rounded-full cursor-pointer text-xs">
              <span>Browse</span>
              <span className="truncate text-slate-400">
                {file ? file.name : "No file selected"}
              </span>
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileChange}
              />
            </label>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full inline-block">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="px-8 h-9 rounded-full bg-[#8bc34a] text-white text-sm font-semibold disabled:opacity-60"
            >
              {isLoading ? "Uploading..." : "Upload"}
            </button>
          </form>

          {/* Results */}
          {results && (
            <div className="pt-6">
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-2 items-center">
                  <h4 className="font-semibold">Import Results</h4>
                  <Badge tone="success">
                    {results.filter((r) => r.status === "success").length} Success
                  </Badge>
                  <Badge tone="error">
                    {results.filter((r) => r.status === "error").length} Failed
                  </Badge>
                </div>

                <button
                  onClick={downloadFailed}
                  className="text-xs border px-3 py-1 rounded-full"
                >
                  Download Failed
                </button>
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Row</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Employee ID</th>
                      <th className="px-3 py-2">First</th>
                      <th className="px-3 py-2">Middle</th>
                      <th className="px-3 py-2">Last</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.map((r) => {
                      const p = pickPreview(r.data);
                      return (
                        <tr key={r.row} className="border-t">
                          <td className="px-3 py-2">{r.row}</td>
                          <td className="px-3 py-2">
                            <Badge
                              tone={r.status === "success" ? "success" : "error"}
                            >
                              {r.status}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">{p.employeeId}</td>
                          <td className="px-3 py-2">{p.firstName}</td>
                          <td className="px-3 py-2">{p.middleName}</td>
                          <td className="px-3 py-2">{p.lastName}</td>
                          <td className="px-3 py-2">{p.email}</td>
                          <td className="px-3 py-2">
                            <details>
                              <summary className="cursor-pointer text-slate-500">
                                View JSON
                              </summary>
                              <pre className="mt-2 bg-slate-50 p-2 rounded text-[11px]">
                                {JSON.stringify(r.data || {}, null, 2)}
                              </pre>
                            </details>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
