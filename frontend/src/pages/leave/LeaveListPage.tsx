// frontend/src/pages/leave/LeaveListPage.tsx
import { useState } from "react";
import {
  useGetLeaveTypesQuery,
  useGetAllLeavesQuery,
  LeaveFilters,
} from "../../features/leave/leaveApi";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";
const selectCls = inputCls;

export default function LeaveListPage() {
  // Filter form state
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  const [fromDate, setFromDate] = useState(
    today.toISOString().slice(0, 10)
  );
  const [toDate, setToDate] = useState(nextYear.toISOString().slice(0, 10));
  const [status, setStatus] = useState<"" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED">(
    ""
  );
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [subUnit, setSubUnit] = useState("");
  const [includePastEmployees, setIncludePastEmployees] = useState(false);

  // "Applied" filters that actually go to the query
  const [activeFilters, setActiveFilters] = useState<LeaveFilters | undefined>(
    undefined
  );

  const { data: leaveTypes = [] } = useGetLeaveTypesQuery();
  const {
    data: leaves = [],
    isLoading,
  } = useGetAllLeavesQuery(activeFilters);

  function handleReset() {
    setFromDate(today.toISOString().slice(0, 10));
    setToDate(nextYear.toISOString().slice(0, 10));
    setStatus("");
    setLeaveTypeId("");
    setEmployeeName("");
    setSubUnit("");
    setIncludePastEmployees(false);
    setActiveFilters(undefined);
  }

  function handleSearch() {
    setActiveFilters({
      fromDate,
      toDate,
      status: status || undefined,
      typeId: leaveTypeId || undefined,
      // employee / subunit filters can be wired when backend has them:
      // employeeId: ...
      includePastEmployees,
    });
  }

  return (
    <div className="h-full bg-[#f5f6fa] px-6 py-4 overflow-y-auto">
      {/* Top nav inside Leave module */}
      <div className="flex items-center gap-2 mb-4">
        {[
          "Apply",
          "My Leave",
          "Entitlements",
          "Reports",
          "Configure",
          "Leave List",
          "Assign Leave",
        ].map((item) => {
          const isActive = item === "Leave List";
          return (
            <button
              key={item}
              type="button"
              className={[
                "px-5 h-9 rounded-full text-[12px] border transition",
                isActive
                  ? "bg-[#fef4ea] border-[#f7941d] text-[#f7941d] font-semibold"
                  : "bg-white border-[#e5e7f0] text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {item}
              {["Entitlements", "Reports", "Configure"].includes(item) && (
                <span className="ml-1 text-[10px] align-middle">▼</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search card */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-5">
        <div className="px-7 py-4 border-b border-[#edf0f7]">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Leave List
          </h2>
        </div>

        <div className="px-7 pt-5 pb-4 text-[12px]">
          {/* Row 1 */}
          <div className="grid grid-cols-4 gap-6 mb-4">
            {/* From Date */}
            <div>
              <label className={labelCls}>From Date</label>
              <input
                type="date"
                className={inputCls}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div>
              <label className={labelCls}>To Date</label>
              <input
                type="date"
                className={inputCls}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* Show Leave with Status */}
            <div>
              <label className={labelCls}>Show Leave with Status*</label>
              <select
                className={selectCls}
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as typeof status)
                }
              >
                <option value="">-- Select --</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              {/* Small chip row like screenshot */}
              <div className="mt-2">
                <span className="inline-flex items-center px-2 h-6 rounded-full bg-[#fef4ea] text-[11px] text-[#f7941d] border border-[#fbd7a5]">
                  Pending Approval
                </span>
              </div>
            </div>

            {/* Leave Type */}
            <div>
              <label className={labelCls}>Leave Type</label>
              <select
                className={selectCls}
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
              >
                <option value="">-- Select --</option>
                {leaveTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 gap-6 items-end">
            {/* Employee Name */}
            <div>
              <label className={labelCls}>Employee Name</label>
              <input
                className={inputCls}
                placeholder="Type for hints..."
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />
            </div>

            {/* Sub Unit */}
            <div>
              <label className={labelCls}>Sub Unit</label>
              <select
                className={selectCls}
                value={subUnit}
                onChange={(e) => setSubUnit(e.target.value)}
              >
                <option value="">-- Select --</option>
                {/* plug real departments here later */}
              </select>
            </div>

            {/* spacer */}
            <div />

            {/* Include Past Employees toggle + buttons */}
            <div className="flex items-center justify-end gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-600">
                  Include Past Employees
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setIncludePastEmployees((v) => !v)
                  }
                  className={`w-10 h-5 rounded-full flex items-center px-1 ${
                    includePastEmployees
                      ? "bg-[#8bc34a]"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      includePastEmployees ? "translate-x-4" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Buttons row */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 h-8 rounded-full border border-[#8bc34a] text-[12px] text-[#8bc34a] bg-white hover:bg-[#f4fbec]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="px-6 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342]"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results card */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-8">
        <div className="px-7 py-4 border-b border-[#edf0f7]">
          {isLoading ? (
            <p className="text-[11px] text-slate-500">Loading...</p>
          ) : leaves.length === 0 ? (
            <p className="text-[11px] text-slate-500">
              No Records Found
            </p>
          ) : null}
        </div>

        <div className="px-7 pt-3 pb-6">
          <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
            <table className="w-full text-[11px] text-slate-700">
              <thead className="bg-[#f5f6fb] text-slate-500">
                <tr>
                  <th className="px-3 py-2 w-8">
                    <input type="checkbox" disabled />
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Employee Name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Leave Type
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Leave Balance (Days)
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Number of Days
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Comments
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => {
                  const typeName =
                    typeof l.type === "string"
                      ? l.type
                      : l.type?.name ?? "";
                  const fullName =
                    l.employee && typeof l.employee === "object"
                      ? `${l.employee.firstName ?? ""} ${
                          l.employee.lastName ?? ""
                        }`.trim()
                      : "";
                  const dateText = `${l.fromDate.slice(
                    0,
                    10
                  )} - ${l.toDate.slice(0, 10)}`;

                  return (
                    <tr
                      key={l._id}
                      className="border-t border-[#f0f1f7]"
                    >
                      <td className="px-3 py-2">
                        <input type="checkbox" />
                      </td>
                      <td className="px-3 py-2">{dateText}</td>
                      <td className="px-3 py-2">{fullName}</td>
                      <td className="px-3 py-2">{typeName}</td>
                      <td className="px-3 py-2">--</td>
                      <td className="px-3 py-2">
                        {l.days ?? ""}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={[
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px]",
                            l.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-700"
                              : l.status === "REJECTED"
                              ? "bg-rose-100 text-rose-700"
                              : l.status === "CANCELLED"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-amber-100 text-amber-700",
                          ].join(" ")}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 max-w-xs truncate">
                        {l.reason || "--"}
                      </td>
                      <td className="px-3 py-2">
                        {/* hook up approve / reject later */}
                        <span className="text-[#f7941d] cursor-pointer">
                          View
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {leaves.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-6 text-center text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
