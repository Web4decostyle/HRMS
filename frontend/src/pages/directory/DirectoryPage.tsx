// frontend/src/pages/directory/DirectoryPage.tsx
import { useState } from "react";
import { useGetEmployeesQuery } from "../../features/employees/employeesApi";

export default function DirectoryPage() {
  const [filters, setFilters] = useState({
    name: "",
    jobTitle: "",
    subUnit: "",
  });

  const { data: employees } = useGetEmployeesQuery(
    filters.name || filters.jobTitle || filters.subUnit
      ? {
          name: filters.name || undefined,
          jobTitle: filters.jobTitle || undefined,
          subUnit: filters.subUnit || undefined,
        }
      : undefined
  );

  function handleReset() {
    setFilters({ name: "", jobTitle: "", subUnit: "" });
  }

  return (
    <div className="min-h-screen bg-[#f4f5fb] p-8">
      {/* PAGE TITLE */}
      <h1 className="text-lg font-semibold text-slate-700 mb-6">Directory</h1>

      {/* FILTER CARD */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* EMPLOYEE NAME */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Employee Name</label>
            <input
              value={filters.name}
              onChange={(e) =>
                setFilters({ ...filters, name: e.target.value })
              }
              placeholder="Type for hints..."
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            />
          </div>

          {/* JOB TITLE */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Job Title</label>
            <select
              value={filters.jobTitle}
              onChange={(e) =>
                setFilters({ ...filters, jobTitle: e.target.value })
              }
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="">-- Select --</option>
              <option value="Manager">Manager</option>
              <option value="Team Lead">Team Lead</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          {/* LOCATION (use subUnit / department) */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Location</label>
            <select
              value={filters.subUnit}
              onChange={(e) =>
                setFilters({ ...filters, subUnit: e.target.value })
              }
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="">-- Select --</option>
              <option value="Indore">Indore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-6 py-2 rounded-full border border-slate-300 text-slate-700 text-xs hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            className="px-6 py-2 rounded-full bg-green-600 text-white text-xs hover:bg-green-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* RESULTS */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-6">
        <div className="text-xs text-slate-600 mb-4">
          ({employees?.length ?? 0}) Record Found
        </div>

        {/* GRID OF EMPLOYEE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees?.map((emp) => (
            <div
              key={emp._id}
              className="bg-white rounded-xl shadow border border-slate-200 p-6 flex flex-col items-center text-center"
            >
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mb-4"></div>

              {/* Name */}
              <div className="text-sm font-semibold text-slate-700">
                {emp.firstName} {emp.lastName}
              </div>

              {/* Job Title */}
              <div className="text-[11px] text-slate-500 mt-1">
                {emp.jobTitle || "-"}
              </div>

              {/* Location */}
              <div className="text-[11px] text-slate-400 mt-1">
                {emp.department || "-"}
              </div>
            </div>
          ))}

          {!employees?.length && (
            <div className="text-xs text-slate-400 col-span-full text-center py-10">
              No Records Found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
