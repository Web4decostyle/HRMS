// frontend/src/pages/directory/DirectoryPage.tsx
import { useState } from "react";
import { useSearchEmployeesQuery } from "../../features/directory/directoryApi";

export default function DirectoryPage() {
  const [q, setQ] = useState("");
  const { data } = useSearchEmployeesQuery(q ? { q } : undefined);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">
        Directory · Employees
      </h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex gap-2 text-xs">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="flex-1 rounded-md border border-slate-200 px-2 py-1"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((emp) => (
            <div
              key={emp._id}
              className="border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50"
            >
              <div className="font-semibold text-slate-800">
                {emp.firstName} {emp.lastName}
              </div>
              {emp.jobTitle && (
                <div className="text-[11px] text-slate-500">
                  {emp.jobTitle}
                </div>
              )}
              {emp.location && (
                <div className="text-[11px] text-slate-400">
                  {emp.location}
                </div>
              )}
              <div className="mt-1 text-[11px] text-slate-600">
                {emp.email}
                {emp.phone && ` · ${emp.phone}`}
              </div>
            </div>
          ))}
          {!data?.length && (
            <div className="text-xs text-slate-400">
              No employees found. Try another search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
