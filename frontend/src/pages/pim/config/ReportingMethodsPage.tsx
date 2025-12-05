import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetReportingMethodsQuery,
  useDeleteReportingMethodMutation,
} from "../../../features/pim/pimConfigApi";
import { Trash2, Pencil } from "lucide-react";

const tabBase =
  "px-5 py-2 text-xs md:text-sm rounded-full transition-colors whitespace-nowrap";

export default function ReportingMethodsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetReportingMethodsQuery();
  const [deleteMethod] = useDeleteReportingMethodMutation();

  const methods = data?.data || [];
  const used = methods.length;

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this reporting method?"))
      return;
    await deleteMethod(id);
  };

  return (
    <div className="px-8 py-6 space-y-6">
      {/* PIM / Configuration header + tabs */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          PIM / Configuration
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Configuration (active) */}
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

      {/* Card */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm md:text-base font-semibold text-slate-800">
            Reporting Methods
          </h2>

          <Link
            to="/pim/config/reporting-methods/add"
            className="inline-flex items-center px-4 py-2 rounded-full bg-lime-500 text-white text-xs md:text-sm font-semibold shadow-sm hover:bg-lime-600"
          >
            <span className="mr-1 text-base leading-none">+</span>
            <span>Add</span>
          </Link>
        </div>

        {/* Record count row */}
        <div className="px-6 py-3 border-b border-slate-100 text-[11px] md:text-xs text-slate-500">
          ({used}) Record{used === 1 ? "" : "s"} Found
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">
            Loading reporting methods…
          </div>
        ) : methods.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">
            No reporting methods found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f8fafc] text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      readOnly
                    />
                  </th>
                  <th className="px-2 py-3 text-left whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-6 py-3 text-center whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="text-slate-700">
                {methods.map((m: any, index: number) => (
                  <tr
                    key={m._id}
                    className={`border-t border-slate-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-[#fafbff]"
                    } hover:bg-slate-50 transition-colors`}
                  >
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        readOnly
                      />
                    </td>
                    <td className="px-2 py-3 text-sm">{m.name}</td>
                    <td className="px-6 py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
                          disabled
                          title="Edit (not implemented yet)"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(m._id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}