import { useMemo, useState } from "react";
import {
  useGetLeaveTypesQuery,
  useGetMyLeavesQuery,
  LeaveStatus,
} from "../../features/leave/leaveApi";

import LeaveModuleTabs from "./LeaveModuleTabs";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";
const selectCls = inputCls;

type MyStatusFilter = "" | LeaveStatus | "SCHEDULED" | "TAKEN";

const STATUS_CHIPS: { value: MyStatusFilter; label: string }[] = [
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "PENDING", label: "Pending Approval" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "TAKEN", label: "Taken" },
];

export default function MyLeavePage() {
  const today = new Date();
  const defaultFrom = today.toISOString().slice(0, 10);
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const defaultTo = nextYear.toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [status, setStatus] = useState<MyStatusFilter>("");
  const [leaveTypeId, setLeaveTypeId] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: defaultFrom,
    toDate: defaultTo,
    status: "" as MyStatusFilter,
    leaveTypeId: "",
  });

  const { data: leaveTypes = [] } = useGetLeaveTypesQuery();
  const { data: leaves = [], isLoading } = useGetMyLeavesQuery();

  const filteredLeaves = useMemo(() => {
    const startFilter = appliedFilters.fromDate
      ? new Date(appliedFilters.fromDate)
      : null;
    const endFilter = appliedFilters.toDate
      ? new Date(appliedFilters.toDate)
      : null;
    if (startFilter) startFilter.setHours(0, 0, 0, 0);
    if (endFilter) endFilter.setHours(23, 59, 59, 999);

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    return leaves.filter((l) => {
      const from = new Date(l.fromDate);
      const to = new Date(l.toDate);
      from.setHours(0, 0, 0, 0);
      to.setHours(0, 0, 0, 0);

      if (startFilter && from < startFilter) return false;
      if (endFilter && to > endFilter) return false;

      if (appliedFilters.leaveTypeId) {
        const t = l.type;
        if (typeof t === "string") {
          if (t !== appliedFilters.leaveTypeId) return false;
        } else if (t && t._id !== appliedFilters.leaveTypeId) {
          return false;
        }
      }

      switch (appliedFilters.status) {
        case "":
          return true;
        case "PENDING":
        case "APPROVED":
        case "REJECTED":
        case "CANCELLED":
          return l.status === appliedFilters.status;
        case "SCHEDULED":
          return l.status === "APPROVED" && from >= todayMidnight;
        case "TAKEN":
          return l.status === "APPROVED" && to < todayMidnight;
        default:
          return true;
      }
    });
  }, [leaves, appliedFilters]);

  function handleReset() {
    setFromDate(defaultFrom);
    setToDate(defaultTo);
    setStatus("");
    setLeaveTypeId("");
    setAppliedFilters({
      fromDate: defaultFrom,
      toDate: defaultTo,
      status: "",
      leaveTypeId: "",
    });
  }

  function handleSearch() {
    setAppliedFilters({
      fromDate,
      toDate,
      status,
      leaveTypeId,
    });
  }

  return (
    <div className="h-full bg-[#f5f6fa] px-6 py-4 overflow-y-auto">
      <LeaveModuleTabs activeKey="my-leave" />

      {/* Search card */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-5">
        <div className="px-7 py-4 border-b border-[#edf0f7]">
          <h2 className="text-[13px] font-semibold text-slate-800">
            My Leave List
          </h2>
        </div>

        <div className="px-7 pt-5 pb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>From</label>
              <input
                type="date"
                className={inputCls}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>To</label>
              <input
                type="date"
                className={inputCls}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>Leave Type</label>
              <select
                className={selectCls}
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
              >
                <option value="">All</option>
                {leaveTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select
                className={selectCls}
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {STATUS_CHIPS.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => setStatus(chip.value)}
                  className={[
                    "px-3 h-8 rounded-full text-[11px] font-semibold border",
                    status === chip.value
                      ? "bg-[#fef4ea] border-[#f7941d] text-[#f7941d]"
                      : "bg-white border-[#e5e7f0] text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 h-9 rounded-full border border-[#d5d7e5] bg-white text-slate-700 font-semibold text-[12px] hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="px-5 h-9 rounded-full bg-[#8bc34a] text-white font-semibold text-[12px] hover:bg-[#7cb342]"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm overflow-hidden">
        <div className="px-7 py-4 border-b border-[#edf0f7]">
          <h2 className="text-[13px] font-semibold text-slate-800">Results</h2>
        </div>

        <div className="px-4 py-4 overflow-x-auto">
          {isLoading ? (
            <div className="text-[12px] text-slate-500 px-3 py-4">Loading…</div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-[12px] text-slate-500 px-3 py-4">
              No leave requests found.
            </div>
          ) : (
            <table className="w-full text-[12px] text-slate-700">
              <thead className="bg-[#f5f6fb] text-slate-600">
                <tr>
                  <th className="px-3 py-2 w-8">
                    <input type="checkbox" disabled />
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="px-3 py-2 text-left font-semibold">Leave Type</th>
                  <th className="px-3 py-2 text-left font-semibold">Number of Days</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-left font-semibold">Comments</th>
                  <th className="px-3 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeaves.map((l) => {
                  const typeName =
                    typeof l.type === "string" ? l.type : l.type?.name ?? "";
                  const dateText = `${l.fromDate.slice(0, 10)} - ${l.toDate.slice(
                    0,
                    10
                  )}`;

                  return (
                    <tr key={l._id} className="border-t border-[#f0f1f7]">
                      <td className="px-3 py-2">
                        <input type="checkbox" />
                      </td>
                      <td className="px-3 py-2">{dateText}</td>
                      <td className="px-3 py-2">{typeName}</td>
                      <td className="px-3 py-2">{l.days ?? ""}</td>
                      <td className="px-3 py-2">
                        <span
                          className={[
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px]",
                            l.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-700"
                              : l.status === "REJECTED"
                              ? "bg-rose-100 text-rose-700"
                              : l.status === "CANCELLED"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-amber-100 text-amber-700",
                          ].join(" ")}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{l.reason || "--"}</td>
                      <td className="px-3 py-2">
                        <span className="text-slate-400">—</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
