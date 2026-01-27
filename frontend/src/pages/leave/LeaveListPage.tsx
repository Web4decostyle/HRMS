// frontend/src/pages/leave/LeaveListPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetLeaveTypesQuery,
  useGetAllLeavesQuery,
  useUpdateLeaveStatusMutation,
  LeaveFilters,
  LeaveStatus,
} from "../../features/leave/leaveApi";
import { selectAuthRole } from "../../features/auth/selectors";

/* ------------------------------------------------------------------
   Style helpers
------------------------------------------------------------------ */
const labelCls = "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a]/40";
const selectCls = inputCls;

const chipBase =
  "inline-flex items-center gap-2 px-3 h-8 rounded-full border text-[12px] font-semibold transition";
const btnBase =
  "px-4 h-9 rounded-full text-[12px] font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed";
const btnPrimary = "bg-[#8bc34a] text-white hover:bg-[#7cb342]";
const btnOutlinered = "border border-[#8bc34a] text-[#7cb342] bg-white hover:bg-[#f4fbec]";
const btnGhost = "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

/* ------------------------------------------------------------------
   Tabs config
------------------------------------------------------------------ */
type MenuKey = "entitlements" | "reports" | "configure" | null;

const TABS = [
  { key: "apply", label: "Apply", path: "/leave/apply" },
  { key: "my-leave", label: "My Leave", path: "/leave/my-leave" },
  {
    key: "entitlements",
    label: "Entitlements",
    isMenu: true as const,
    menu: [
      { label: "Add Entitlements", path: "/leave/entitlements/add" },
      { label: "Employee Entitlements", path: "/leave/entitlements/employee" },
      { label: "My Entitlements", path: "/leave/entitlements/my" },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    isMenu: true as const,
    menu: [
      {
        label: "Leave Entitlements and Usage Report",
        path: "/leave/reports/entitlements-usage",
      },
      {
        label: "My Leave Entitlements and Usage Report",
        path: "/leave/reports/my-entitlements-usage",
      },
    ],
  },
  {
    key: "configure",
    label: "Configure",
    isMenu: true as const,
    menu: [
      { label: "Leave Period", path: "/leave/config/period" },
      { label: "Leave Types", path: "/leave/config/types" },
      { label: "Work Week", path: "/leave/config/work-week" },
      { label: "Holidays", path: "/leave/config/holidays" },
    ],
  },
  { key: "leave-list", label: "Leave List", path: "/leave" },
  { key: "assign-leave", label: "Assign Leave", path: "/leave/assign" },
] as const;

/* ------------------------------------------------------------------
   Status filter helpers
------------------------------------------------------------------ */
type LeaveStatusFilter = "" | LeaveStatus;

const STATUS_CHIPS: { value: LeaveStatusFilter; label: string }[] = [
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
];

function fmtDateRange(from: string, to: string) {
  const a = from?.slice(0, 10);
  const b = to?.slice(0, 10);
  return `${a} → ${b}`;
}

function StatusPill({
  status,
  pendingWith,
}: {
  status: LeaveStatus;
  pendingWith?: string | null;
}) {
  const label =
    status === "PENDING" && pendingWith ? `PENDING (${pendingWith})` : status;

  const cls =
    status === "APPROVED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "REJECTED"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : status === "CANCELLED"
      ? "bg-slate-100 text-slate-700 border-slate-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export default function LeaveListPage() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const role = useSelector(selectAuthRole) ?? "ESS";

  const [updateLeaveStatus, { isLoading: updatingStatus }] =
    useUpdateLeaveStatusMutation();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filter form state
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  const [fromDate, setFromDate] = useState(today.toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(nextYear.toISOString().slice(0, 10));
  const [status, setStatus] = useState<LeaveStatusFilter>("");

  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [subUnit, setSubUnit] = useState("");
  const [includePastEmployees, setIncludePastEmployees] = useState(false);

  const [activeFilters, setActiveFilters] = useState<LeaveFilters | undefined>(undefined);

  const { data: leaveTypes = [] } = useGetLeaveTypesQuery();
  const { data: leaves = [], isLoading, isFetching } = useGetAllLeavesQuery(activeFilters);

  const activeTabKey = "leave-list";

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
      includePastEmployees,
    });
  }

  async function handleDecision(leaveId: string, nextStatus: "APPROVED" | "REJECTED") {
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await updateLeaveStatus({
        id: leaveId,
        status: nextStatus,
        remarks: "",
      }).unwrap();

      // (Your old logic had HR routing text. If you still want it, keep it.)
      if (nextStatus === "APPROVED" && (updated as any).status === "PENDING") {
        setActionSuccess("Approval recorded. Request remains pending.");
      } else {
        setActionSuccess(`Leave ${nextStatus.toLowerCase()} successfully.`);
      }
    } catch (e: any) {
      setActionError(e?.data?.message || "Failed to update leave status.");
    }
  }

  // Counts for chips (from currently loaded leaves)
  const chipCounts = useMemo(() => {
    const counts: Record<string, number> = { REJECTED: 0, CANCELLED: 0, PENDING: 0, APPROVED: 0 };
    for (const l of leaves) {
      if (counts[l.status] !== undefined) counts[l.status] += 1;
    }
    return counts;
  }, [leaves]);

  const headerSummary = useMemo(() => {
    const range = fmtDateRange(fromDate, toDate);
    const st = status ? status : "All";
    return `${range} • Status: ${st}`;
  }, [fromDate, toDate, status]);

  return (
    <div className="h-full bg-[#f5f6fa] px-6 py-4 overflow-y-auto">
      {/* Top Tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTabKey;
          const isMenuTab = "isMenu" in tab && tab.isMenu;
          const menuItems = isMenuTab ? tab.menu : undefined;

          return (
            <div key={tab.key} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (isMenuTab && menuItems) {
                    setOpenMenu((prev) => (prev === tab.key ? null : (tab.key as MenuKey)));
                  } else if ("path" in tab) {
                    navigate(tab.path);
                  }
                }}
                className={[
                  "px-5 h-9 rounded-full text-[12px] border transition flex items-center",
                  isActive
                    ? "bg-[#fef4ea] border-[#f7941d] text-[#f7941d] font-semibold"
                    : "bg-white border-[#e5e7f0] text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <span>{tab.label}</span>
                {isMenuTab && <span className="ml-1 text-[10px] align-middle">▼</span>}
              </button>

              {isMenuTab && openMenu === tab.key && menuItems && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-[#e5e7f0] shadow-lg z-20 text-[12px] overflow-hidden">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#fef4ea] hover:text-[#f7941d]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Page Header */}
      <div className="mb-4 rounded-[18px] border border-[#e5e7f0] bg-gradient-to-r from-white to-[#fff7ee] shadow-sm">
        <div className="px-7 py-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-[15px] font-extrabold text-slate-900">Leave List</div>
            <div className="text-[12px] text-slate-500 mt-1">{headerSummary}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUS_CHIPS.map((c) => {
                const active = status === c.value;
                const count = c.value ? (chipCounts[c.value] || 0) : leaves.length;
                return (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setStatus((prev) => (prev === c.value ? "" : c.value))}
                    className={[
                      chipBase,
                      active
                        ? "bg-[#fef4ea] text-[#f7941d] border-[#fbd7a5]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-[#fef4ea] hover:text-[#f7941d] hover:border-[#fbd7a5]",
                    ].join(" ")}
                    title={`Filter: ${c.label}`}
                  >
                    <span>{c.label}</span>
                    <span
                      className={[
                        "px-2 py-0.5 rounded-full text-[11px] border",
                        active
                          ? "bg-white border-[#fbd7a5] text-[#f7941d]"
                          : "bg-slate-50 border-slate-200 text-slate-500",
                      ].join(" ")}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button className={`${btnBase} ${btnGhost}`} onClick={handleReset}>
              Reset
            </button>
            <button className={`${btnBase} ${btnPrimary}`} onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(actionError || actionSuccess) && (
        <div className="mb-4 space-y-2">
          {actionError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
              <p className="text-[12px] text-rose-700 font-semibold">{actionError}</p>
            </div>
          )}
          {actionSuccess && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-[12px] text-emerald-700 font-semibold">{actionSuccess}</p>
            </div>
          )}
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-5 overflow-hidden">
        <div className="px-7 py-4 border-b border-[#edf0f7] flex items-center justify-between">
          <div>
            <div className="text-[13px] font-bold text-slate-900">Filters</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Refine results by date range, status, type, and optional fields.
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button className={`${btnBase} ${btnGhost}`} onClick={handleReset}>
              Reset
            </button>
            <button className={`${btnBase} ${btnPrimary}`} onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        <div className="px-7 pt-5 pb-6 text-[12px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className={labelCls}>From Date</label>
              <input type="date" className={inputCls} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>

            <div>
              <label className={labelCls}>To Date</label>
              <input type="date" className={inputCls} value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value as LeaveStatusFilter)}>
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Leave Type</label>
              <select className={selectCls} value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)}>
                <option value="">All</option>
                {leaveTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Employee Name</label>
              <input
                className={inputCls}
                placeholder="Type for hints..."
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />
              <div className="text-[10px] text-slate-400 mt-1">(Optional UI filter only)</div>
            </div>

            <div>
              <label className={labelCls}>Sub Unit</label>
              <select className={selectCls} value={subUnit} onChange={(e) => setSubUnit(e.target.value)}>
                <option value="">All</option>
              </select>
              <div className="text-[10px] text-slate-400 mt-1">(Optional UI filter only)</div>
            </div>

            <div className="md:col-span-2 flex items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-[12px] text-slate-700 font-semibold">Include Past Employees</div>
                <button
                  type="button"
                  onClick={() => setIncludePastEmployees((v) => !v)}
                  className={`w-12 h-6 rounded-full flex items-center px-1 border transition ${
                    includePastEmployees ? "bg-[#8bc34a] border-[#8bc34a]" : "bg-slate-200 border-slate-200"
                  }`}
                  title="Toggle past employees"
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      includePastEmployees ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <button className={`${btnBase} ${btnOutlinered}`} onClick={handleReset}>
                  Reset
                </button>
                <button className={`${btnBase} ${btnPrimary}`} onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Card */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-8 overflow-hidden">
        <div className="px-7 py-4 border-b border-[#edf0f7] flex items-center justify-between">
          <div className="text-[13px] font-bold text-slate-900">Results</div>
          <div className="text-[11px] text-slate-500">
            {isLoading ? "Loading..." : `${leaves.length} record(s)`}
            {isFetching ? " • refreshing…" : ""}
          </div>
        </div>

        <div className="px-7 py-4">
          <div className="border border-[#e3e5f0] rounded-2xl overflow-hidden">
            <table className="w-full text-[12px] text-slate-700">
              <thead className="bg-[#f5f6fb] text-slate-500">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <input type="checkbox" disabled />
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">Date</th>
                  <th className="px-3 py-3 text-left font-semibold">Employee</th>
                  <th className="px-3 py-3 text-left font-semibold">Leave Type</th>
                  <th className="px-3 py-3 text-left font-semibold">Balance</th>
                  <th className="px-3 py-3 text-left font-semibold">Days</th>
                  <th className="px-3 py-3 text-left font-semibold">Status</th>
                  <th className="px-3 py-3 text-left font-semibold">Comments</th>
                  <th className="px-3 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                      Loading leave requests…
                    </td>
                  </tr>
                ) : leaves.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                      No records found for selected filters.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l, idx) => {
                    const typeName = typeof l.type === "string" ? l.type : (l.type?.name ?? "");
                    const pendingWith = (l as any).pendingWith;
                    const fullName =
                      l.employee && typeof l.employee === "object"
                        ? `${l.employee.firstName ?? ""} ${l.employee.lastName ?? ""}`.trim()
                        : "--";
                    const dateText = `${l.fromDate.slice(0, 10)} - ${l.toDate.slice(0, 10)}`;

                    const canSupervisorAct =
                      l.status === "PENDING" &&
                      pendingWith === "SUPERVISOR" &&
                      (role === "SUPERVISOR" || role === "ADMIN");

                    const canHrAct =
                      l.status === "PENDING" &&
                      pendingWith === "HR" &&
                      (role === "HR" || role === "ADMIN");

                    const canAct = canSupervisorAct || canHrAct;

                    return (
                      <tr
                        key={l._id}
                        className={[
                          "border-t border-[#f0f1f7] hover:bg-[#fbfcff] transition",
                          idx % 2 === 0 ? "bg-white" : "bg-[#fcfdff]",
                        ].join(" ")}
                      >
                        <td className="px-3 py-3">
                          <input type="checkbox" />
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-[12px] font-semibold text-slate-800">{dateText}</div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="text-[12px] font-semibold text-slate-900">{fullName}</div>
                        </td>

                        <td className="px-3 py-3">{typeName || "--"}</td>

                        <td className="px-3 py-3 text-slate-500">--</td>

                        <td className="px-3 py-3 font-semibold text-slate-800">{l.days ?? "--"}</td>

                        <td className="px-3 py-3">
                          <StatusPill status={l.status} pendingWith={pendingWith} />
                        </td>

                        <td className="px-3 py-3 max-w-[260px]">
                          <div className="truncate text-slate-600">{l.reason || "--"}</div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {canAct ? (
                              <>
                                <button
                                  type="button"
                                  disabled={updatingStatus}
                                  onClick={() => handleDecision(l._id, "APPROVED")}
                                  className="px-3 h-8 rounded-full bg-[#8bc34a] text-white text-[11px] font-bold hover:bg-[#7cb342] disabled:opacity-60"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  disabled={updatingStatus}
                                  onClick={() => handleDecision(l._id, "REJECTED")}
                                  className="px-3 h-8 rounded-full border border-rose-300 text-rose-700 bg-white text-[11px] font-bold hover:bg-rose-50 disabled:opacity-60"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400">—</span>
                            )}

                            <button
                              type="button"
                              className="px-3 h-8 rounded-full border border-[#fbd7a5] bg-[#fef4ea] text-[#f7941d] text-[11px] font-bold hover:brightness-95"
                              onClick={() => navigate(`/leave/list/${l._id}`)}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Small footer note */}
          <div className="mt-3 text-[11px] text-slate-400">
            Tip: Click <span className="font-semibold text-slate-500">View</span> to see full details + history.
          </div>
        </div>
      </div>
    </div>
  );
}
