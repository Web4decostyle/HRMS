import { useMemo, useState } from "react";
import { useGetEmployeesQuery } from "../../features/employees/employeesApi";

export default function DirectoryPage() {
  // UI fields (what user types/selects)
  const [ui, setUi] = useState({
    name: "",
    jobTitle: "",
    location: "",
  });

  // Applied filters (only set when Search is clicked)
  const [applied, setApplied] = useState({
    name: "",
    jobTitle: "",
    location: "",
  });

  const queryArgs = useMemo(() => {
    const has =
      applied.name.trim() || applied.jobTitle.trim() || applied.location.trim();

    if (!has) return undefined;

    return {
      name: applied.name.trim() || undefined,
      jobTitle: applied.jobTitle || undefined,
      subUnit: applied.location || undefined, // mapping location -> subUnit/department filter
    };
  }, [applied]);

  const { data: employees = [], isLoading } = useGetEmployeesQuery(queryArgs);

  function onReset() {
    setUi({ name: "", jobTitle: "", location: "" });
    setApplied({ name: "", jobTitle: "", location: "" });
  }

  function onSearch() {
    setApplied({
      name: ui.name,
      jobTitle: ui.jobTitle,
      location: ui.location,
    });
  }

  return (
    <div className="min-h-screen bg-[#f4f5fb] px-8 py-6">
      {/* FILTER CARD */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {/* Header row */}
        <div className="px-6 pt-6 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-slate-700">Directory</h1>

          {/* Collapse icon (visual only) */}
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
            title="Collapse"
          >
            ▴
          </button>
        </div>

        <div className="px-6 pb-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Employee Name */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">
                Employee Name
              </label>
              <input
                value={ui.name}
                onChange={(e) => setUi((s) => ({ ...s, name: e.target.value }))}
                placeholder="Type for hints..."
                className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200"
              />
            </div>

            {/* Job Title */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Job Title</label>

              <div className="relative">
                <select
                  value={ui.jobTitle}
                  onChange={(e) =>
                    setUi((s) => ({ ...s, jobTitle: e.target.value }))
                  }
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs appearance-none outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200"
                >
                  <option value="">-- Select --</option>
                  {/* TODO: replace with dynamic job titles from backend later */}
                  <option value="Manager">Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Staff">Staff</option>
                </select>

                {/* right dropdown pill  */}
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  ▾
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Location</label>

              <div className="relative">
                <select
                  value={ui.location}
                  onChange={(e) =>
                    setUi((s) => ({ ...s, location: e.target.value }))
                  }
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs appearance-none outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200"
                >
                  <option value="">-- Select --</option>
                  {/* TODO: replace with dynamic locations from backend later */}
                  <option value="Indore">Indore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                </select>

                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  ▾
                </div>
              </div>
            </div>
          </div>

          {/* Divider  */}
          <div className="mt-6 border-t border-slate-100" />

          {/* Buttons row */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onReset}
              className="h-9 px-10 rounded-full border border-[#76c043] text-[#76c043] text-xs font-semibold bg-white hover:bg-[#f6fff0]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onSearch}
              className="h-9 px-10 rounded-full bg-[#76c043] text-white text-xs font-semibold hover:opacity-95"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* RESULTS WRAP (grey zone like screenshot) */}
      <section className="mt-6 bg-[#e9ecf1] rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 text-slate-600 text-sm">
          ({isLoading ? "…" : employees.length}) Records Found
        </div>

        <div className="px-6 pb-8">
          {/* Employee cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {!isLoading &&
              employees.map((emp: any) => (
                <div
                  key={emp._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center"
                >
                  <div className="text-sm font-semibold text-slate-700 capitalize mb-4">
                    {(emp.firstName || "") + " " + (emp.lastName || "")}
                  </div>

                  {/* Avatar */}
                  <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-slate-300" />
                  </div>

                  {/* Optional meta (hidden in screenshot cards, keep minimal) */}
                  {/* <div className="mt-3 text-[11px] text-slate-500">
                    {emp.jobTitle || "-"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {emp.department || "-"}
                  </div> */}
                </div>
              ))}

            {isLoading && (
              <div className="col-span-full text-xs text-slate-500">
                Loading…
              </div>
            )}

            {!isLoading && employees.length === 0 && (
              <div className="col-span-full text-center text-sm text-slate-500 py-10">
                No Records Found
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
