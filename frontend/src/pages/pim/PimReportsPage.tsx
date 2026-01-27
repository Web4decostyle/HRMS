// frontend/src/pages/pim/PimReportsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

import {
  useGetPimReportsQuery,
  useDeletePimReportMutation,
  PimReport,
} from "../../features/pim/pimReportsApi";
import { FiTrash2, FiEdit2, FiCopy } from "react-icons/fi";

const tabBase =
  "px-5 py-2 text-xs md:text-sm rounded-full transition-colors whitespace-nowrap";

export default function PimReportsPage() {
  const [searchName, setSearchName] = useState("");
  const [configOpen, setConfigOpen] = useState(false);

  const navigate = useNavigate();

  const { data: reports, isLoading } = useGetPimReportsQuery(
    searchName ? { q: searchName } : undefined
  );

  const [deleteReport, { isLoading: isDeleting }] =
    useDeletePimReportMutation();

  const handleDelete = async (report: PimReport) => {
    if (!window.confirm(`Delete report "${report.name}"?`)) return;
    try {
      await deleteReport(report._id).unwrap();
    } catch (err) {
      console.error("Delete report failed", err);
      alert("Failed to delete report");
    }
  };

  const recordCount = reports?.length ?? 0;

  return (
    <div className="flex min-h-screen bg-[#f4f5fb]">
      {/* Left main sidebar (white) */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Top red gradient bar with user menu */}
        <Topbar />

        <main className="flex-1 px-8 py-6 space-y-6">
          {/* PIM heading + top tabs (Reports active) */}
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold text-slate-800">PIM</h1>

            <div className="flex flex-wrap items-center gap-2">
              {/* Configuration + dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setConfigOpen((open) => !open)}
                  className={`${tabBase} ${
                    configOpen
                      ? "bg-red-100 text-red-600 border border-red-200"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>Configuration</span>
                  <span className="ml-1 text-[10px] align-middle">▾</span>
                </button>

                {configOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-100 text-xs text-slate-600 z-20">
                    <button
                      type="button"
                      onClick={() => {
                        setConfigOpen(false);
                        navigate("/pim/config/optional-fields");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50"
                    >
                      Optional Fields
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfigOpen(false);
                        navigate("/pim/config/custom-fields");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50"
                    >
                      Custom Fields
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfigOpen(false);
                        navigate("/pim/config/data-import");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50"
                    >
                      Data Import
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfigOpen(false);
                        navigate("/pim/config/reporting-methods");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50"
                    >
                      Reporting Methods
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfigOpen(false);
                        navigate("/pim/config/termination-reasons");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 rounded-b-xl"
                    >
                      Termination Reasons
                    </button>
                  </div>
                )}
              </div>

              {/* Employee List */}
              <button
                type="button"
                className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
                onClick={() => navigate("/pim")}
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

              {/* Reports (active) */}
              <button
                type="button"
                className={`${tabBase} bg-red-500 text-white shadow-sm`}
                onClick={() => navigate("/pim/reports")}
              >
                Reports
              </button>
            </div>
          </div>

          
          <div className="space-y-5">
            {/* Search Card */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700">
                  Employee Reports
                </h2>
                <button
                  type="button"
                  className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 text-xs hover:bg-slate-50"
                >
                  ▴
                </button>
              </div>

              <div className="space-y-4">
                <label className="block text-[11px] font-medium text-slate-500">
                  Report Name
                  <input
                    type="text"
                    placeholder="Type for hints..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </label>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSearchName("")}
                    className="px-6 py-1.5 text-xs rounded-full border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="px-6 py-1.5 text-xs rounded-full bg-[#6fb64a] text-white font-medium hover:bg-[#63a441]"
                  >
                    Search
                  </button>
                </div>
              </div>
            </section>

            {/* List Card */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-0 overflow-hidden">
              {/* Add button row */}
              <div className="px-6 pt-4 pb-3 flex items-center">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#6fb64a] text-white text-xs font-semibold shadow-sm hover:bg-[#63a441]"
                  onClick={() => navigate("/pim/reports/add")}
                >
                  <span className="text-base leading-none">+</span>
                  <span>Add</span>
                </button>
              </div>

              <div className="border-t border-slate-100" />

              {/* Table header */}
              <div className="px-6 py-2 text-[11px] text-slate-500">
                ({recordCount}) Record{recordCount === 1 ? "" : "s"} Found
              </div>

              <div className="border-t border-slate-100" />

              <div className="w-full">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f3f5fa] text-[11px] text-slate-500">
                    <tr>
                      <th className="w-[40px] px-6 py-2">
                        <input type="checkbox" className="accent-red-500" />
                      </th>
                      <th className="px-3 py-2 font-medium">
                        <div className="inline-flex items-center gap-1">
                          <span>Name</span>
                          <span className="text-[9px]">⇅</span>
                        </div>
                      </th>
                      <th className="px-3 py-2 font-medium text-right pr-6">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-6 text-center text-slate-400 text-xs"
                        >
                          Loading reports…
                        </td>
                      </tr>
                    )}

                    {!isLoading && recordCount === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-6 text-center text-slate-400 text-xs"
                        >
                          No reports found.
                        </td>
                      </tr>
                    )}

                    {reports?.map((report) => (
                      <tr
                        key={report._id}
                        className="border-t border-slate-100 hover:bg-red-50/30"
                      >
                        <td className="px-6 py-3">
                          <input
                            type="checkbox"
                            className="accent-red-500"
                          />
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {report.name}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-2 pr-6">
                            <button
                              type="button"
                              className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                              title="Delete"
                              disabled={isDeleting}
                              onClick={() => handleDelete(report)}
                            >
                              <FiTrash2 className="text-[13px]" />
                            </button>
                            <button
                              type="button"
                              className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                              title="Edit"
                              onClick={() =>
                                navigate(`/pim/reports/${report._id}/edit`)
                              }
                            >
                              <FiEdit2 className="text-[13px]" />
                            </button>
                            <button
                              type="button"
                              className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                              title="Copy"
                              onClick={() =>
                                navigate(`/pim/reports/${report._id}/copy`)
                              }
                            >
                              <FiCopy className="text-[13px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
