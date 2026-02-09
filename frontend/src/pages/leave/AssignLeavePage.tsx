import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useGetLeaveTypesQuery,
  useAssignLeaveMutation,
} from "../../features/leave/leaveApi";

import {
  useGetEmployeesSimpleQuery,
  type SimpleEmployee,
} from "../../features/employees/employeesApi";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";

const inputCls =
  "w-full h-10 rounded-xl border border-[#d5d7e5] bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a]/40";

const textareaCls =
  "w-full min-h-[90px] rounded-xl border border-[#d5d7e5] bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a]/40";

const selectCls = inputCls;

type MenuKey = "configure" | null;

const TABS = [
  { key: "apply", label: "Apply", path: "/leave/apply" },
  { key: "my-leave", label: "My Leave", path: "/leave/my-leave" },
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
  const { data: employees = [], isLoading: empLoading } =
    useGetEmployeesSimpleQuery();

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

  const filteredEmployees = useMemo(() => {
    const q = employeeQuery.trim().toLowerCase();
    if (!q) return employees.slice(0, 25);

    return employees
      .filter((e: SimpleEmployee) => {
        const name = (e.fullName || "").trim().toLowerCase();
        return name.includes(q);
      })
      .slice(0, 25);
  }, [employeeQuery, employees]);

  const selectedEmployee = useMemo(() => {
    return employees.find((e: SimpleEmployee) => String(e._id) === String(employeeId));
  }, [employees, employeeId]);

  const days = useMemo(() => calcDaysInclusive(fromDate, toDate), [fromDate, toDate]);

  const canSubmit = useMemo(() => {
    if (!employeeId) return false;
    if (!leaveTypeId) return false;
    if (!fromDate || !toDate) return false;
    if (days <= 0) return false;
    return true;
  }, [employeeId, leaveTypeId, fromDate, toDate, days]);

  async function handleAssign() {
    setError(null);
    setSuccess(null);

    if (!employeeId) return setError("Please select an employee.");
    if (!leaveTypeId) return setError("Please select a leave type.");
    if (!fromDate || !toDate) return setError("Please select From and To date.");
    if (days <= 0) return setError("To date cannot be before From date.");

    try {
      await assignLeave({
        employeeId,
        typeId: leaveTypeId,
        fromDate,
        toDate,
        reason: comments?.trim() || undefined,
      }).unwrap();

      setSuccess("Leave assigned successfully!");
      setComments("");
      setEmployeeQuery("");
      setEmployeeId("");
      setLeaveTypeId("");
      setFromDate(todayStr);
      setToDate(todayStr);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to assign leave");
    }
  }

  return (
    <div className="h-full bg-[#f5f6fa] px-6 py-4 overflow-y-auto">
      {/* Top nav */}
      <div className="flex items-center gap-2 mb-4">
        {TABS.map((tab) => {
          const isMenuTab = "isMenu" in tab;
          const isActive =
            tab.key === activeTabKey && tab.label === "Assign Leave";

          return (
            <div key={tab.key} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (isMenuTab) {
                    setOpenMenu((prev) =>
                      prev === tab.key ? null : (tab.key as MenuKey)
                    );
                  } else {
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
                {isMenuTab && <span className="ml-1 text-[10px]">▼</span>}
              </button>

              {isMenuTab && openMenu === tab.key && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-[#e5e7f0] shadow-lg z-20 text-[12px]">
                  {tab.menu.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#fef4ea] hover:text-[#f7941d]"
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
              <h2 className="text-[14px] font-bold text-slate-900">
                Special Cases
              </h2>
              <p className="text-[12px] text-slate-500 mt-1">
                Assign leave to an employee directly (Admin/HR).
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <div className="rounded-2xl border border-[#f3e2cf] bg-white px-4 py-2">
                <div className="text-[10px] text-slate-400 font-semibold">
                  Days
                </div>
                <div className="text-[13px] font-bold text-slate-900">
                  {days || 0}
                </div>
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
                  placeholder={
                    empLoading ? "Loading employees..." : "Search employee name..."
                  }
                  value={employeeQuery}
                  onChange={(e) => {
                    setEmployeeQuery(e.target.value);
                    setEmployeeOpen(true);
                    setEmployeeId("");
                  }}
                  onFocus={() => setEmployeeOpen(true)}
                />

                {employeeOpen && (
                  <div className="absolute z-20 w-full bg-white border border-[#e5e7f0] rounded-xl shadow-lg mt-2 max-h-60 overflow-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="px-3 py-2 text-[12px] text-slate-500">
                        No employees found
                      </div>
                    ) : (
                      filteredEmployees.map((emp) => {
                        const name = (emp.fullName || "").trim();
                        return (
                          <button
                            type="button"
                            key={emp._id}
                            onClick={() => {
                              setEmployeeId(emp._id);
                              setEmployeeQuery(name);
                              setEmployeeOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-[#fef4ea] hover:text-[#f7941d]"
                          >
                            <div className="text-[12px] font-semibold">
                              {name || "(No name)"}
                            </div>
                            {emp.status && (
                              <div className="text-[11px] text-slate-500">
                                Status: {emp.status}
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {selectedEmployee && (
                <div className="text-[11px] text-slate-500 mt-2">
                  Selected:{" "}
                  <span className="font-semibold text-slate-800">
                    {(selectedEmployee.fullName || "").trim()}
                  </span>
                </div>
              )}
            </div>

            {/* Leave type */}
            <div>
              <label className={labelCls}>Leave Type *</label>
              <select
                className={selectCls}
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
              >
                <option value="">Select</option>
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
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelCls}>From Date *</label>
              <input
                className={inputCls}
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                max={toDate || undefined}
              />
            </div>

            <div>
              <label className={labelCls}>To Date *</label>
              <input
                className={inputCls}
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate || undefined}
              />
            </div>

            <div className="flex items-end">
              <div className="rounded-2xl border border-[#e5e7f0] bg-white p-4 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Days</span>
                  <span className="font-semibold text-slate-900">
                    {days || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className={labelCls}>Comments</label>
            <textarea
              className={textareaCls}
              placeholder="Optional comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          {/* Messages */}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/leave")}
              className="px-5 h-10 rounded-full border border-[#d5d7e5] bg-white text-slate-700 font-semibold text-[13px] hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAssign}
              disabled={!canSubmit || isLoading}
              className="px-6 h-10 rounded-full bg-[#8bc34a] text-white font-semibold text-[13px] hover:bg-[#7cb342] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Assigning..." : "Assign Leave"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}