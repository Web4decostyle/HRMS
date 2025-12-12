// frontend/src/pages/pim/config/DataImportPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadImportMutation } from "../../../features/pim/pimConfigApi";

const tabBase =
  "px-5 py-2 text-xs md:text-sm rounded-full transition-colors whitespace-nowrap";

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
  parseErrors?: string[];
};

export default function DataImportPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailedResults, setDetailedResults] = useState<ImportRowResult[] | null>(
    null
  );

  const [uploadImport, { isLoading }] = useUploadImportMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setMessage(null);
    setError(null);
    setDetailedResults(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setDetailedResults(null);

    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = (await uploadImport(formData).unwrap()) as UploadResponse;

      if (res?.summary) {
        setMessage(
          `Imported: ${res.summary.success}/${res.summary.total} succeeded, ${res.summary.failed} failed`
        );
      } else {
        setMessage(res?.message ?? "Import completed successfully.");
      }

      if (res?.results) setDetailedResults(res.results);
      setFile(null);
    } catch (err: any) {
      console.error("PIM import failed", err);
      // RTK Query error shape may vary; try common fields
      const msg =
        err?.data?.message ??
        err?.error ??
        (typeof err === "string" ? err : undefined) ??
        "Failed to upload/import file. Please try again.";
      setError(msg);
    }
  };

  function downloadFailedAsCsv() {
    if (!detailedResults) {
      alert("No import results available.");
      return;
    }

    const failed = detailedResults.filter((r) => r.status === "error");
    if (failed.length === 0) {
      alert("No failed rows to download.");
      return;
    }

    const header = ["Row", "Errors", "Data"];
    const rows = failed.map((f) => [
      String(f.row),
      (f.errors || []).join("; "),
      JSON.stringify(f.data || {}),
    ]);

    const csv = [header, ...rows]
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "");
            return `"${s.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-failed-rows.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const sampleUrl = "/api/pim/import/sample";

  return (
    <div className="flex min-h-screen bg-[#f4f5fb]">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 px-8 py-6 space-y-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold text-slate-800">
              PIM / Configuration
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={`${tabBase} bg-green-500 text-white shadow-sm`}
              >
                Configuration
              </button>

              <button
                type="button"
                className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
                onClick={() => navigate("/pim")}
              >
                Employee List
              </button>

              <button
                type="button"
                className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
                onClick={() => navigate("/employees/add")}
              >
                Add Employee
              </button>

              <button
                type="button"
                className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
                onClick={() => navigate("/pim/reports")}
              >
                Reports
              </button>
            </div>
          </div>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm md:text-base font-semibold text-slate-800">
                Data Import
              </h2>
            </div>

            <div className="px-6 pt-6 pb-4">
              <div className="rounded-2xl bg-[#f2f4f8] px-6 py-4 mb-6">
                <h3 className="text-xs font-semibold text-slate-700 mb-2">
                  Note:
                </h3>
                <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                  <li>Column order should not be changed</li>
                  <li>First Name and Last Name are compulsory</li>
                  <li>
                    All date fields should be in <b>YYYY-MM-DD</b> format
                  </li>
                  <li>
                    If gender is specified, value should be either <b>Male</b> or{" "}
                    <b>Female</b>
                  </li>
                  <li>
                    Each import file should be configured for <b>100 records or less</b>
                  </li>
                  <li>Multiple import files may be required</li>
                  <li>
                    Sample CSV file :{" "}
                    <a href={sampleUrl} className="text-[#ff9800] hover:underline">
                      Download
                    </a>
                  </li>
                </ul>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 max-w-xl"
                encType="multipart/form-data"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Select File<span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center justify-between w-full max-w-md px-4 py-2 rounded-full border border-slate-200 bg-white text-xs text-slate-600 cursor-pointer hover:bg-slate-50">
                      <span className="font-semibold">Browse</span>
                      <span className="flex-1 ml-3 truncate text-slate-400">
                        {file ? file.name : "No file selected"}
                      </span>
                      <span className="ml-3 text-slate-300 text-lg">📤</span>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  <p className="text-[10px] text-slate-400">Accepts up to 1MB</p>
                </div>

                {error && (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-full px-3 py-1 inline-block">
                    {error}
                  </p>
                )}
                {message && (
                  <p className="text-xs text-green-600 bg-green-50 border border-green-100 rounded-full px-3 py-1 inline-block">
                    {message}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4">
                  <p className="text-[10px] text-slate-400">* Required</p>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 h-9 rounded-full bg-[#8bc34a] text-white text-xs md:text-sm font-semibold shadow-sm hover:bg-[#7cb342] disabled:opacity-60"
                  >
                    {isLoading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </form>

              {/* results */}
              {detailedResults && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">Import Results</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={downloadFailedAsCsv}
                        className="px-3 py-1 rounded-full border text-xs hover:bg-slate-50"
                      >
                        Download Failed
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border rounded">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-3 py-2 text-left w-20">Row</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Errors</th>
                          <th className="px-3 py-2 text-left">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedResults.map((r) => (
                          <tr key={r.row} className="odd:bg-white even:bg-slate-50/50">
                            <td className="px-3 py-2">{r.row}</td>
                            <td
                              className={`px-3 py-2 ${
                                r.status === "success" ? "text-green-700" : "text-red-600"
                              }`}
                            >
                              {r.status}
                            </td>
                            <td className="px-3 py-2">{r.errors?.join("; ")}</td>
                            <td className="px-3 py-2">
                              <pre className="whitespace-normal max-w-xl text-[11px]">
                                {JSON.stringify(r.data || {}, null, 0)}
                              </pre>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
