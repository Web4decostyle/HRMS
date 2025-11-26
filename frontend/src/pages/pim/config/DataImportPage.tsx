// frontend/src/pages/pim/config/DataImportPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadImportMutation } from "../../../features/pim/pimConfigApi";

const tabBase =
  "px-5 py-2 text-xs md:text-sm rounded-full transition-colors whitespace-nowrap";

export default function DataImportPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploadImport, { isLoading }] = useUploadImportMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadImport(formData).unwrap();
      // make sure uploadImport is typed as { success: boolean; message?: string }
      setMessage(res?.message || "Import completed successfully.");
      setFile(null);
    } catch (err: any) {
      console.error("PIM import failed", err);
      setError(
        err?.data?.message || "Failed to upload/import file. Please try again."
      );
    }
  };

  // sample CSV link (served by backend GET /api/pim/import/sample)
  const sampleUrl = "/api/pim/import/sample";

  return (
    <div className="px-8 py-6 space-y-6">
      {/* PIM / Configuration header + tabs */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          PIM / Configuration
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Configuration tab (active) */}
          <button
            type="button"
            className={`${tabBase} bg-orange-500 text-white shadow-sm`}
          >
            Configuration
          </button>

          {/* Employee List */}
          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/employees")}
          >
            Employee List
          </button>

          {/* Add Employee */}
          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/employees/add")}
          >
            Add Employee
          </button>

          {/* Reports */}
          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/pim/reports")}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Data Import card */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm md:text-base font-semibold text-slate-800">
            Data Import
          </h2>
        </div>

        {/* Note section */}
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
                If gender is specified, value should be either <b>MALE</b> or{" "}
                <b>FEMALE</b>
              </li>
              <li>
                Each import file should be configured for{" "}
                <b>100 records or less</b>
              </li>
              <li>Multiple import files may be required</li>
              <li>
                Sample CSV file :{" "}
                <a
                  href={sampleUrl}
                  className="text-orange-500 hover:underline"
                >
                  Download
                </a>
              </li>
            </ul>
          </div>

          {/* Upload form */}
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
                  <span className="ml-3 text-slate-300 text-lg">⭳</span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <p className="text-[10px] text-slate-400">
                Accepts up to 1MB
              </p>
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

            {/* Footer */}
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
        </div>
      </section>
    </div>
  );
}
