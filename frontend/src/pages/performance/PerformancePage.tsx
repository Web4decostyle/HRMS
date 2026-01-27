// frontend/src/pages/performance/PerformancePage.tsx
import { FormEvent, useState } from "react";
import { NavLink } from "react-router-dom";
import { useGetReviewsQuery } from "../../features/performance/performanceApi";

type PerformanceFilters = {
  employeeName: string;
  jobTitle: string;
  subUnit: string;
  include: "CURRENT" | "PAST" | "ALL";
  status: string;
  fromDate: string;
  toDate: string;
};

/** Local top tabs bar for Performance module (Configure / Manage Reviews / etc.) */
const PerformanceTabs = () => {
  const base = "/performance";

  const linkBase =
    "px-4 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap";
  const getClassName = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${linkBase} bg-white text-green-600 shadow-sm`
      : `${linkBase} text-green-50/90 hover:bg-white/10`;

  const dropdownLinkBase =
    "block px-3 py-1.5 text-[11px] whitespace-nowrap border-b last:border-b-0";
  const getDropdownClassName = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${dropdownLinkBase} bg-green-50 text-green-700 font-semibold`
      : `${dropdownLinkBase} text-slate-600 hover:bg-slate-50`;

  return (
    <div className="flex flex-wrap gap-2">
      {/* CONFIGURE + DROPDOWN (KPIs, Trackers) */}
      <div className="relative group">
        <NavLink to={`${base}/configure/kpis`} className={getClassName}>
          Configure ▾
        </NavLink>

        <div className="absolute right-0 mt-1 hidden min-w-[180px] rounded-lg bg-white shadow-lg border border-slate-200 group-hover:block z-20">
          <NavLink
            to={`${base}/configure/kpis`}
            className={getDropdownClassName}
          >
            KPIs
          </NavLink>
          <NavLink
            to={`${base}/configure/trackers`}
            className={getDropdownClassName}
          >
            Trackers
          </NavLink>
        </div>
      </div>

      {/* MANAGE REVIEWS + DROPDOWN (all review pages) */}
      <div className="relative group">
        <NavLink to={`${base}/manage/reviews`} className={getClassName}>
          Manage Reviews ▾
        </NavLink>

        <div className="absolute right-0 mt-1 hidden min-w-[200px] rounded-lg bg-white shadow-lg border border-slate-200 group-hover:block z-20">
          <NavLink
            to={`${base}/manage/reviews`}
            className={getDropdownClassName}
          >
            Review List
          </NavLink>
          <NavLink to={`${base}/manage/add`} className={getDropdownClassName}>
            Add Review
          </NavLink>
          <NavLink to={`${base}/my-reviews`} className={getDropdownClassName}>
            My Reviews
          </NavLink>
          <NavLink
            to={`${base}/employee-reviews`}
            className={getDropdownClassName}
          >
            Employee Reviews
          </NavLink>
        </div>
      </div>

      {/* TRACKERS (direct links) */}
      <NavLink to={`${base}/my-trackers`} className={getClassName}>
        My Trackers
      </NavLink>
      <NavLink to={`${base}/employee-trackers`} className={getClassName}>
        Employee Trackers
      </NavLink>
    </div>
  );
};

const defaultFilters: PerformanceFilters = {
  employeeName: "",
  jobTitle: "",
  subUnit: "",
  include: "CURRENT",
  status: "",
  fromDate: "2025-01-01",
  toDate: "2025-12-31",
};

export default function PerformancePage() {
  const [filters, setFilters] = useState<PerformanceFilters>(defaultFilters);

  // this state is what we actually send to the API
  const [queryFilters, setQueryFilters] = useState<PerformanceFilters>(
    defaultFilters
  );

  // RTK Query now gets an arg (the active filters)
  const { data: reviews } = useGetReviewsQuery(queryFilters);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // when user hits Search, we update the active filters → refetch
    setQueryFilters(filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setQueryFilters(defaultFilters);
  };

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          Performance / Manage Reviews
        </h1>

        {/* red top bar + tabs () */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl px-4 py-2 shadow-sm flex items-center justify-between">
          <div className="text-xs text-green-50/90">
            Performance <span className="opacity-75">/</span>{" "}
            <span className="font-medium">Manage Reviews</span>
          </div>
          <PerformanceTabs />
        </div>
      </div>

      {/* Filter card */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Employee Reviews
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1 */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Employee Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-500">
                Employee Name
              </label>
              <input
                type="text"
                value={filters.employeeName}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, employeeName: e.target.value }))
                }
                placeholder="Type for hints..."
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-[11px] placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Job Title */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-500">
                Job Title
              </label>
              <select
                value={filters.jobTitle}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, jobTitle: e.target.value }))
                }
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="">-- Select --</option>
                {/* hook real job titles later */}
              </select>
            </div>

            {/* Sub Unit */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-500">
                Sub Unit
              </label>
              <select
                value={filters.subUnit}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, subUnit: e.target.value }))
                }
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="">-- Select --</option>
              </select>
            </div>

            {/* Include */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-500">
                Include
              </label>
              <select
                value={filters.include}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    include: e.target.value as PerformanceFilters["include"],
                  }))
                }
                className="w-full rounded-full border border-slate-200 px-3 py-2 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="CURRENT">Current Employees Only</option>
                <option value="ALL">Current and Past Employees</option>
                <option value="PAST">Past Employees Only</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Review Status */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-500">
                Review Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="">-- Select --</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>

            {/* From Date */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-500">
                From Date
              </label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, fromDate: e.target.value }))
                }
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* To Date */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-500">
                To Date
              </label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, toDate: e.target.value }))
                }
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-1.5 rounded-full border border-lime-400 text-[11px] font-semibold text-lime-500 hover:bg-lime-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-1.5 rounded-full bg-lime-500 text-white text-[11px] font-semibold hover:bg-lime-600"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Table card */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 pt-4 pb-2 text-xs text-slate-500">
          {reviews && reviews.length > 0 ? null : "No Records Found"}
        </div>

        <div className="border-t border-slate-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[11px] text-slate-500 border-b">
              <tr>
                <th className="py-2 px-4 font-medium">Employee</th>
                <th className="py-2 px-4 font-medium">Job Title</th>
                <th className="py-2 px-4 font-medium">Sub Unit</th>
                <th className="py-2 px-4 font-medium">Review Period</th>
                <th className="py-2 px-4 font-medium">Due Date</th>
                <th className="py-2 px-4 font-medium">Review Status</th>
                <th className="py-2 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews && reviews.length > 0 ? (
                reviews.map((r) => {
                  const emp =
                    typeof r.employee === "object" && r.employee
                      ? r.employee
                      : null;

                  const employeeName = emp
                    ? `${emp.firstName} ${emp.lastName}`
                    : typeof r.employee === "string"
                    ? r.employee
                    : "-";

                  const jobTitle = emp?.jobTitle ?? "-";
                  const subUnit = emp?.department ?? "-";

                  // use periodFrom / periodTo instead of periodStart / periodEnd
                  const periodFrom = r.periodFrom
                    ? r.periodFrom.slice(0, 10)
                    : "-";
                  const periodTo = r.periodTo ? r.periodTo.slice(0, 10) : "-";
                  const period = `${periodFrom} – ${periodTo}`;

                  // prefer explicit dueDate, fall back to periodTo
                  const dueDate =
                    (r.dueDate ?? r.periodTo)?.slice(0, 10) ?? "-";

                  return (
                    <tr
                      key={r._id}
                      className="border-b last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="py-2 px-4">{employeeName}</td>
                      <td className="py-2 px-4">{jobTitle}</td>
                      <td className="py-2 px-4">{subUnit}</td>
                      <td className="py-2 px-4">{period}</td>
                      <td className="py-2 px-4">{dueDate}</td>
                      <td className="py-2 px-4">{r.status}</td>
                      <td className="py-2 px-4 text-right">
                        <button className="text-[11px] font-medium text-green-600 hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 px-4 text-center text-slate-400 text-xs"
                  >
                    No reviews found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
