import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const valueCls = "text-[12px] text-slate-700";

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

const activeTabKey = "configure";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function computePeriod(startMonthIndex: number, startDay: number) {
  const year = new Date().getFullYear();
  const start = new Date(year, startMonthIndex, startDay);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  end.setDate(end.getDate() - 1);
  return { start, end };
}

function formatDateISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function LeavePeriodPage() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  
  const today = new Date();
  const [startMonthIndex, setStartMonthIndex] = useState<number>(
    today.getMonth()
  );
  const [startDay, setStartDay] = useState<number>(today.getDate());

  const { start, end } = useMemo(
    () => computePeriod(startMonthIndex, startDay),
    [startMonthIndex, startDay]
  );

  function handleReset() {
    setStartMonthIndex(today.getMonth());
    setStartDay(today.getDate());
  }

  function handleSave() {
    // later: call backend mutation like saveLeavePeriod(...)
    console.log("Leave period saved:", {
      startMonthIndex,
      startDay,
      startISO: formatDateISO(start),
      endISO: formatDateISO(end),
    });
  }

  const endText = `${MONTHS[end.getMonth()]} ${end.getDate()} (Following Year)`;
  const currentPeriodText = `${formatDateISO(start)} to ${formatDateISO(end)}`;

  // keep day options 1–31 (we let JS clamp invalid days automatically)
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

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
            Leave Period
          </h2>
        </div>

        <div className="px-7 pt-5 pb-6 text-[12px] space-y-5">
          <div className="grid grid-cols-3 gap-6">
            {/* Start Month */}
            <div>
              <label className={labelCls}>Start Month*</label>
              <div className="relative">
                <select
                  className="w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 pr-7 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a] appearance-none"
                  value={startMonthIndex}
                  onChange={(e) =>
                    setStartMonthIndex(Number(e.target.value))
                  }
                >
                  {MONTHS.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Start Date (day) */}
            <div>
              <label className={labelCls}>Start Date*</label>
              <div className="relative">
                <select
                  className="w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 pr-7 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a] appearance-none"
                  value={startDay}
                  onChange={(e) => setStartDay(Number(e.target.value))}
                >
                  {dayOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* End Date text */}
            <div>
              <label className={labelCls}>End Date</label>
              <div className={valueCls}>{endText}</div>
            </div>
          </div>

          {/* Current Leave Period line */}
          <div className="mt-4">
            <span className={`${labelCls} mb-0`}>Current Leave Period</span>
            <div className={valueCls}>{currentPeriodText}</div>
          </div>

          <p className="text-[10px] text-slate-400 mt-2">* Required</p>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 h-8 rounded-full border border-[#8bc34a] text-[12px] text-[#8bc34a] bg-white hover:bg-[#f4fbec]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-8 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342]"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
