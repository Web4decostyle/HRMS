import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetLeaveTypesQuery,
  useAddLeaveEntitlementMutation,
} from "../../features/leave/leaveApi";
import { useGetEmployeesQuery } from "../../features/employees/employeesApi";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";
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
  { key: "leave-list", label: "Leave List", path: "/leave" },
  { key: "assign-leave", label: "Assign Leave", path: "/leave/assign" },
] as const;

const activeTabKey = "entitlements";

export default function AddLeaveEntitlementPage() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  // radio – for now we only implement Individual Employee
  const [mode, setMode] = useState<"INDIVIDUAL" | "MULTIPLE">("INDIVIDUAL");
  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [days, setDays] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const periodStart = today.toISOString().slice(0, 10);
  const periodEnd = nextYear.toISOString().slice(0, 10);

  const { data: leaveTypes = [] } = useGetLeaveTypesQuery();
  const { data: employees = [] } = useGetEmployeesQuery(undefined);
  const [addEntitlement, { isLoading }] = useAddLeaveEntitlementMutation();

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (mode !== "INDIVIDUAL") {
      setError("Multiple Employees mode is not implemented yet.");
      return;
    }
    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }
    if (!leaveTypeId) {
      setError("Please select a leave type.");
      return;
    }
    if (!days || Number(days) <= 0) {
      setError("Please enter entitlement days.");
      return;
    }

    try {
      await addEntitlement({
        employeeId,
        leaveTypeId,
        periodStart,
        periodEnd,
        days: Number(days),
      }).unwrap();
      setSuccess("Leave entitlement saved.");
      setDays("");
    } catch (e: any) {
      setError(e?.data?.message || "Failed to save entitlement.");
    }
  };

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
            Add Leave Entitlement
          </h2>
        </div>

        <div className="px-7 pt-5 pb-6 text-[12px] space-y-6">
          {/* Add to */}
          <div>
            <p className={labelCls}>Add to</p>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 text-[12px] text-slate-700">
                <input
                  type="radio"
                  checked={mode === "INDIVIDUAL"}
                  onChange={() => setMode("INDIVIDUAL")}
                />
                <span>Individual Employee</span>
              </label>
              <label className="flex items-center gap-2 text-[12px] text-slate-700">
                <input
                  type="radio"
                  checked={mode === "MULTIPLE"}
                  onChange={() => setMode("MULTIPLE")}
                />
                <span>Multiple Employees (coming soon)</span>
              </label>
            </div>
          </div>

          {/* Row: Employee name */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className={labelCls}>Employee Name*</label>
              <select
                className={selectCls}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">Type for hints...</option>
                {employees.map((e: any) => (
                  <option key={e._id} value={e._id}>
                    {e.employeeId
                      ? `${e.employeeId} - ${e.firstName} ${e.lastName}`
                      : `${e.firstName} ${e.lastName}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Leave type / period / entitlement */}
          <div className="grid grid-cols-3 gap-6">
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

            <div>
              <label className={labelCls}>Leave Period*</label>
              <input
                className={selectCls}
                readOnly
                value={`${periodStart} - ${periodEnd}`}
              />
            </div>

            <div>
              <label className={labelCls}>Entitlement*</label>
              <input
                type="number"
                min={0}
                step="0.5"
                className={inputCls}
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <p className="text-[11px] text-rose-600 mt-2">{error}</p>
          )}
          {success && (
            <p className="text-[11px] text-emerald-600 mt-2">{success}</p>
          )}

          {/* Buttons */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 h-8 rounded-full border border-[#8bc34a] text-[12px] text-[#8bc34a] bg-white hover:bg-[#f4fbec]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mt-1">* Required</p>
        </div>
      </div>
    </div>
  );
}
