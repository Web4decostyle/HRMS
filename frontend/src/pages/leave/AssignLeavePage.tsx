import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGetLeaveTypesQuery, useAssignLeaveMutation } from "../../features/leave/leaveApi";
import { useGetEmployeesSimpleQuery } from "../../features/employees/employeesApi";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";

const inputCls =
  "w-full h-10 rounded-xl border border-[#d5d7e5] bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a]/40";

const textareaCls =
  "w-full min-h-[90px] rounded-xl border border-[#d5d7e5] bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a]/40";

const selectCls = inputCls;

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
      { label: "Leave Entitlements and Usage Report", path: "/leave/reports/entitlements-usage" },
      { label: "My Leave Entitlements and Usage Report", path: "/leave/reports/my-entitlements-usage" },
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

const activeTabKey = "assign-leave";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function calcDaysInclusive(fromDate: string, toDate: string) {
  if (!fromDate || !toDate) return 0;
  const a = new Date(fromDate);
  const b = new Date(toDate);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const diff = b.getTime() - a.getTime();
  if (diff < 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export default function AssignLeavePage() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  const todayStr = toISODate(new Date());

  // employee combobox states
  const [employeeQuery, setEmployeeQuery] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeOpen, setEmployeeOpen] = useState(false);

  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [comments, setComments] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: leaveTypes = [] } = useGetLeaveTypesQuery();
  const { data: employees = [], isLoading: empLoading } = useGetEmployeesSimpleQuery();

  const [assignLeave, { isLoading }] = useAssignLeaveMutation();

  const employeeBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!employeeBoxRef.current) return;
      if (!employeeBoxRef.current.contains(e.target as any)) {
        setEmployeeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedEmployee = useMemo(() => {
    if (!employeeId) return null;
    return employees.find((e) => e._id === employeeId) || null;
  }, [employeeId, employees]);

  const filteredEmployees = useMemo(() => {
    const q = employeeQuery.trim().toLowerCase();
    if (!q) return employees.slice(0, 25);
    return employees
      .filter((e) => (e.fullName || "").toLowerCase().includes(q))
      .slice(0, 25);
  }, [employeeQuery, employees]);

  const days = useMemo(() => calcDaysInclusive(fromDate, toDate), [fromDate, toDate]);

  const canSubmit = useMemo(() => {
    if (!employeeId) return false;
    if (!leaveTypeId) return false;
    if (!fromDate || !toDate) return false;
    if (new Date(toDate) < new Date(fromDate)) return false;
    return true;
  }, [employeeId, leaveTypeId, fromDate, toDate]);

  async function handleAssign() {
    setError(null);
    setSuccess(null);

    if (!employeeId) return setError("Please select an employee.");
    if (!leaveTypeId) return setError("Please select a leave type.");
    if (!fromDate || !toDate) return setError("From Date and To Date are required.");
    if (new Date(toDate) < new Date(fromDate)) return setError("To Date cannot be before From Date.");

    try {
      await assignLeave({
        employeeId,
        typeId: leaveTypeId,
        fromDate,
        toDate,
        reason: comments?.trim() ? comments.trim() : undefined,
      }).unwrap();

      setSuccess("Leave assigned successfully.");
      setComments("");
      // Keep employee and leave type selected for quick repeated assignments (nice UX)
    } catch (e: any) {
      setError(e?.data?.message || "Failed to assign leave.");
    }
  }

  return (
    <div className="h-full bg-[#f5f6fa] px-6 py-4 overflow-y-auto">
      {/* Top nav */}
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

      {/* Card */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-8 overflow-hidden">
        <div className="px-7 py-5 border-b border-[#edf0f7] bg-gradient-to-r from-[#ffffff] to-[#fff7ee]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-bold text-slate-900">Assign Leave</h2>
              <p className="text-[12px] text-slate-500 mt-1">
                Assign leave to an employee directly (Admin/HR).
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <div className="rounded-2xl border border-[#f3e2cf] bg-white px-4 py-2">
                <div className="text-[10px] text-slate-400 font-semibold">Days</div>
                <div className="text-[13px] font-bold text-slate-900">{days || 0}</div>
              </div>
              <div className="rounded-2xl border border-[#f3e2cf] bg-white px-4 py-2">
                <div className="text-[10px] text-slate-400 font-semibold">Status</div>
                <div className="text-[13px] font-bold text-slate-900">Ready</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-7 pt-6 pb-7 text-[12px] space-y-5">
          {/* Employee combobox */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div ref={employeeBoxRef} className="relative">
              <label className={labelCls}>Employee *</label>

              <div className="relative">
                <input
                  className={inputCls}
                  placeholder={empLoading ? "Loading employees..." : "Search employee name..."}
                  value={employeeQuery}
                  onChange={(e) => {
                    setEmployeeQuery(e.target.value);
                    setEmployeeOpen(true);
                    // if user types after selecting, we de-select until they pick again
                    setEmployeeId("");
                  }}
                  onFocus={() => setEmployeeOpen(true)}
                />

                {/* right adornment */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {selectedEmployee ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEmployeeId("");
                        setEmployeeQuery("");
                        setEmployeeOpen(true);
                      }}
                      className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                      title="Clear selection"
                    >
                      Clear
                    </button>
                  ) : null}

                  <span className="text-slate-400 text-[12px]">⌄</span>
                </div>
              </div>

              {/* Selected pill */}
              {selectedEmployee ? (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
                  <span className="text-[12px] font-semibold text-emerald-700">
                    {selectedEmployee.fullName}
                  </span>
                  <span className="text-[11px] text-emerald-600/80">
                    ({selectedEmployee._id.slice(0, 6)}…)
                  </span>
                </div>
              ) : null}

              {/* dropdown */}
              {employeeOpen && (
                <div className="absolute z-30 mt-2 w-full rounded-2xl border border-[#e5e7f0] bg-white shadow-xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                    <div className="text-[11px] text-slate-500">
                      {empLoading
                        ? "Loading..."
                        : filteredEmployees.length
                        ? "Select an employee"
                        : "No employees found"}
                    </div>
                  </div>

                  <div className="max-h-[260px] overflow-auto">
                    {filteredEmployees.map((e) => (
                      <button
                        key={e._id}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-[#fef4ea] hover:text-[#f7941d] transition"
                        onClick={() => {
                          setEmployeeId(e._id);
                          setEmployeeQuery(e.fullName);
                          setEmployeeOpen(false);
                        }}
                      >
                        <div className="text-[13px] font-semibold text-slate-800">
                          {e.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ID: {e._id.slice(0, 10)}…
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="px-3 py-2 border-t border-slate-100 bg-white">
                    <button
                      type="button"
                      className="text-[12px] font-semibold text-slate-600 hover:text-slate-900"
                      onClick={() => setEmployeeOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* quick summary */}
            <div className="rounded-2xl border border-[#e5e7f0] bg-[#fbfcff] p-4">
              <div className="text-[11px] font-semibold text-slate-500">Summary</div>
              <div className="mt-2 space-y-2 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Employee</span>
                  <span className="font-semibold text-slate-900">
                    {selectedEmployee?.fullName || "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-semibold text-slate-900">
                    {fromDate} → {toDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Days</span>
                  <span className="font-semibold text-slate-900">{days || 0}</span>
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                  Tip: You can keep the same employee selected and assign multiple leaves quickly.
                </div>
              </div>
            </div>
          </div>

          {/* Leave Type + Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Leave Type *</label>
              <select className={selectCls} value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)}>
                <option value="">-- Select --</option>
                {leaveTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-slate-400 mt-1">
                Select the leave type to be assigned.
              </div>
            </div>

            <div className="rounded-2xl border border-[#e5e7f0] bg-white p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Leave Balance</div>
                <div className="text-[14px] font-bold text-slate-900 mt-1">0.00 Day(s)</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  (Later: entitlement - used days)
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-[#fef4ea] border border-[#f3e2cf] flex items-center justify-center">
                <span className="text-[#f7941d] font-bold">LB</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>From Date *</label>
              <input type="date" className={inputCls} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>To Date *</label>
              <input type="date" className={inputCls} value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className={labelCls}>Comments</label>
            <textarea
              className={textareaCls}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Optional note for the employee / record..."
            />
          </div>

          {/* Alerts */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
              <p className="text-[12px] text-rose-700 font-semibold">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-[12px] text-emerald-700 font-semibold">{success}</p>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <p className="text-[11px] text-slate-400">* Required</p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmployeeId("");
                  setEmployeeQuery("");
                  setLeaveTypeId("");
                  setFromDate(todayStr);
                  setToDate(todayStr);
                  setComments("");
                  setError(null);
                  setSuccess(null);
                }}
                className="px-5 h-10 rounded-full border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleAssign}
                disabled={isLoading || !canSubmit}
                className={[
                  "px-8 h-10 rounded-full text-white text-[12px] font-semibold transition",
                  isLoading || !canSubmit
                    ? "bg-[#8bc34a]/60 cursor-not-allowed"
                    : "bg-[#8bc34a] hover:bg-[#7cb342]",
                ].join(" ")}
                title={!canSubmit ? "Select employee, leave type and valid dates" : "Assign leave"}
              >
                {isLoading ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>

          {/* small UX hint */}
          {!employeeId && employeeQuery.trim() && !employeeOpen ? (
            <p className="text-[11px] text-slate-500">
              You typed a name but didn’t select an employee from the list.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
