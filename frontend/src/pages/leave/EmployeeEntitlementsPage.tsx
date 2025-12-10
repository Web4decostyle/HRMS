import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetLeaveTypesQuery,
  useGetLeaveEntitlementsQuery,
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

export default function EmployeeEntitlementsPage() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const [periodStart, setPeriodStart] = useState(
    today.toISOString().slice(0, 10)
  );
  const [periodEnd, setPeriodEnd] = useState(
    nextYear.toISOString().slice(0, 10)
  );

  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");

  const [filters, setFilters] = useState<
    | {
        employeeId?: string;
        leaveTypeId?: string;
        periodStart?: string;
        periodEnd?: string;
      }
    | undefined
  >(undefined);

  const { data: leaveTypes = [] } = useGetLeaveTypesQuery();
  const { data: employees = [] } = useGetEmployeesQuery(undefined);
  const { data: entitlements = [], isLoading } =
    useGetLeaveEntitlementsQuery(filters);

  const handleSearch = () => {
    setFilters({
      employeeId: employeeId || undefined,
      leaveTypeId: leaveTypeId || undefined,
      periodStart,
      periodEnd,
    });
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

      {/* Search card */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-8">
        <div className="px-7 py-4 border-b border-[#edf0f7]">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Leave Entitlements
          </h2>
        </div>

        <div className="px-7 pt-5 pb-4 text-[12px]">
          <div className="grid grid-cols-3 gap-6 mb-4">
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

            <div>
              <label className={labelCls}>Leave Period</label>
              <input
                className={selectCls}
                readOnly
                value={`${periodStart} - ${periodEnd}`}
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mb-3">* Required</p>

          <div className="flex justify-end">
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

      {/* Results table (optional but useful) */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-8">
        <div className="px-7 py-4 border-b border-[#edf0f7]">
          {isLoading ? (
            <p className="text-[11px] text-slate-500">Loading...</p>
          ) : entitlements.length === 0 ? (
            <p className="text-[11px] text-slate-500">No Records Found</p>
          ) : null}
        </div>
        <div className="px-7 pt-3 pb-6">
          <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
            <table className="w-full text-[11px] text-slate-700">
              <thead className="bg-[#f5f6fb] text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">
                    Employee
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Leave Type
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Valid From
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Valid To
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">Days</th>
                </tr>
              </thead>
              <tbody>
                {entitlements.map((e) => {
                  const emp =
                    typeof e.employee === "string"
                      ? undefined
                      : e.employee;
                  const type =
                    typeof e.leaveType === "string"
                      ? undefined
                      : e.leaveType;

                  return (
                    <tr
                      key={e._id}
                      className="border-t border-[#f0f1f7]"
                    >
                      <td className="px-3 py-2">
                        {emp
                          ? `${emp.firstName ?? ""} ${emp.lastName ?? ""}`
                          : "--"}
                      </td>
                      <td className="px-3 py-2">
                        {type?.name ?? "--"}
                      </td>
                      <td className="px-3 py-2">
                        {e.periodStart.slice(0, 10)}
                      </td>
                      <td className="px-3 py-2">
                        {e.periodEnd.slice(0, 10)}
                      </td>
                      <td className="px-3 py-2">{e.days}</td>
                    </tr>
                  );
                })}

                {entitlements.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan={5}
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
