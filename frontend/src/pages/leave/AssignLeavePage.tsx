import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetLeaveTypesQuery,
  useAssignLeaveMutation,
} from "../../features/leave/leaveApi";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";
const textareaCls =
  "w-full min-h-[72px] rounded border border-[#d5d7e5] bg-white px-3 py-2 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";
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
  { key: "leave-list", label: "Leave List", path: "/leave/list" },
  { key: "assign-leave", label: "Assign Leave", path: "/leave/assign" },
] as const;

const activeTabKey = "assign-leave";

export default function AssignLeavePage() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [employeeText, setEmployeeText] = useState(""); // TODO: hook to employee picker
  const [employeeId, setEmployeeId] = useState(""); // internal id (when you wire autocomplete)
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: leaveTypes = [] } = useGetLeaveTypesQuery();
  const [assignLeave, { isLoading }] = useAssignLeaveMutation();

  async function handleAssign() {
    setError(null);
    setSuccess(null);

    // For now, if you don’t have an employee autocomplete,
    // you can manually set employeeId in code while testing.
    if (!employeeId) {
      setError("Employee is required (wire autocomplete to employeeId).");
      return;
    }
    if (!leaveTypeId) {
      setError("Leave type is required.");
      return;
    }
    if (!fromDate || !toDate) {
      setError("From Date and To Date are required.");
      return;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      setError("To Date cannot be before From Date.");
      return;
    }

    try {
      await assignLeave({
        employeeId,
        typeId: leaveTypeId,
        fromDate,
        toDate,
        reason: comments || undefined,
      }).unwrap();

      setSuccess("Leave assigned successfully.");
      setComments("");
      // keep other fields as-is
    } catch (e: any) {
      setError(e?.data?.message || "Failed to assign leave.");
    }
  }

  return (
    <div className="h-full bg-[#f5f6fa] px-6 py-4 overflow-y-auto">
      {/* Top nav */}
      <div className="flex items-center gap-2 mb-4">
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
                    setOpenMenu((prev) =>
                      prev === tab.key ? null : (tab.key as MenuKey)
                    );
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
                {isMenuTab && (
                  <span className="ml-1 text-[10px] align-middle">▼</span>
                )}
              </button>

              {isMenuTab && openMenu === tab.key && menuItems && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-[#e5e7f0] shadow-lg z-20 text-[12px]">
                  {menuItems.map((item) => (
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
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-8">
        <div className="px-7 py-4 border-b border-[#edf0f7]">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Assign Leave
          </h2>
        </div>

        <div className="px-7 pt-5 pb-6 text-[12px] space-y-5">
          {/* Employee */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Employee Name*</label>
              <input
                className={inputCls}
                placeholder="Type for hints..."
                value={employeeText}
                onChange={(e) => {
                  setEmployeeText(e.target.value);
                  // TODO: when you wire autocomplete, also set employeeId here
                }}
              />
            </div>
          </div>

          {/* Leave Type + Balance */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Leave Type*</label>
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

            <div className="flex flex-col justify-end">
              <span className="text-[11px] font-semibold text-slate-500 mb-1">
                Leave Balance
              </span>
              <span className="text-[12px] text-slate-700">
                0.00 Day(s)
              </span>
              {/* later: compute from entitlements + taken days */}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>From Date*</label>
              <input
                type="date"
                className={inputCls}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>To Date*</label>
              <input
                type="date"
                className={inputCls}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className={labelCls}>Comments</label>
            <textarea
              className={textareaCls}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-[11px] text-rose-600">{error}</p>
          )}
          {success && (
            <p className="text-[11px] text-emerald-600">{success}</p>
          )}

          <p className="text-[10px] text-slate-400 mt-1">* Required</p>

          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={handleAssign}
              disabled={isLoading}
              className="px-8 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
            >
              {isLoading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
