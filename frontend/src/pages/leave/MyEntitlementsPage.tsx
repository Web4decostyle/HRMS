import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetLeaveTypesQuery,
  useGetMyLeaveEntitlementsQuery,
} from "../../features/leave/leaveApi";
import { selectAuthRole } from "../../features/auth/selectors";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const selectCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";

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

export default function MyEntitlementsPage() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const role = useSelector(selectAuthRole) ?? "ESS";
  const isApprover = role === "ADMIN" || role === "HR" || role === "SUPERVISOR";

  const visibleTabs = isApprover
    ? TABS
    : ([
        { key: "apply", label: "Apply", path: "/leave/apply" },
        { key: "my-leave", label: "My Leave", path: "/leave/my-leave" },
        {
          key: "entitlements",
          label: "Entitlements",
          isMenu: true as const,
          menu: [{ label: "My Entitlements", path: "/leave/entitlements/my" }],
        },
      ] as const);

  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const [periodStart] = useState(today.toISOString().slice(0, 10));
  const [periodEnd] = useState(nextYear.toISOString().slice(0, 10));

  const [leaveTypeId, setLeaveTypeId] = useState("");

  const { data: leaveTypes = [] } = useGetLeaveTypesQuery();
  const { data: entitlements = [], isLoading } =
    useGetMyLeaveEntitlementsQuery();

  const filtered = useMemo(
    () =>
      entitlements.filter((e) => {
        if (leaveTypeId && typeof e.leaveType !== "string") {
          return e.leaveType._id === leaveTypeId;
        }
        return true;
      }),
    [entitlements, leaveTypeId]
  );

  const totalDays = filtered.reduce((sum, e) => sum + e.days, 0);

  return (
    <div className="h-full bg-[#f5f6fa] px-6 py-4 overflow-y-auto">
      {/* Leave module topbar */}
      <div className="flex items-center gap-2 mb-4">
        {visibleTabs.map((tab) => {
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

      {/* Filter card */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-5">
        <div className="px-7 py-4 border-b border-[#edf0f7]">
          <h2 className="text-[13px] font-semibold text-slate-800">
            My Leave Entitlements
          </h2>
        </div>

        <div className="px-7 pt-5 pb-4 text-[12px]">
          <div className="grid grid-cols-2 gap-6 mb-4">
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

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/leave/entitlements/add")}
              className="px-5 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342]"
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* Entitlements list */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-8">
        <div className="px-7 py-4 border-b border-[#edf0f7] flex justify-between items-center text-[11px]">
          {isLoading ? (
            <p className="text-slate-500">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-slate-500">No Records Found</p>
          ) : (
            <p className="text-slate-500">
              Total <span className="font-semibold">{totalDays}</span> Day(s)
            </p>
          )}
        </div>

        <div className="px-7 pt-3 pb-6">
          <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
            <table className="w-full text-[11px] text-slate-700">
              <thead className="bg-[#f5f6fb] text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">
                    Leave Type
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Entitlement Type
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Valid From
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Valid To
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Days
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const type =
                    typeof e.leaveType === "string"
                      ? undefined
                      : e.leaveType;
                  return (
                    <tr
                      key={e._id}
                      className="border-t border-[#f0f1f7]"
                    >
                      <td className="px-3 py-2">{type?.name ?? "--"}</td>
                      <td className="px-3 py-2">Added</td>
                      <td className="px-3 py-2">
                        {e.periodStart.slice(0, 10)}
                      </td>
                      <td className="px-3 py-2">
                        {e.periodEnd.slice(0, 10)}
                      </td>
                      <td className="px-3 py-2">{e.days}</td>
                      <td className="px-3 py-2 text-[#f7941d]">
                        {/* hook up edit/delete later */}
                        View
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan={6}
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
