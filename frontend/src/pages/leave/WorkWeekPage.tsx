import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetWorkWeekConfigQuery,
  useSaveWorkWeekConfigMutation,
  WorkWeekConfig,
  WorkDayKind,
} from "../../features/leave/leaveApi";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";

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

const activeTabKey = "configure";

// default config, used for initial state & fallback
const DEFAULT_CONFIG: WorkWeekConfig = {
  monday: "FULL",
  tuesday: "FULL",
  wednesday: "FULL",
  thursday: "FULL",
  friday: "FULL",
  saturday: "NONE",
  sunday: "NONE",
};

const DAYS: { key: keyof WorkWeekConfig; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const OPTIONS: { value: WorkDayKind; label: string }[] = [
  { value: "FULL", label: "Full Day" },
  { value: "HALF", label: "Half Day" },
  { value: "NONE", label: "Non-working Day" },
];

export default function WorkWeekPage() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  const { data, isLoading } = useGetWorkWeekConfigQuery();
  const [saveConfig, { isLoading: isSaving }] =
    useSaveWorkWeekConfigMutation();

  // ✅ no more `null` here – default config instead
  const [localConfig, setLocalConfig] =
    useState<WorkWeekConfig>(DEFAULT_CONFIG);

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setLocalConfig(data);
    } else {
      setLocalConfig(DEFAULT_CONFIG);
    }
  }, [data]);

  async function handleSave() {
    setMessage(null);
    try {
      // ✅ localConfig is always a WorkWeekConfig (no union / null)
      await saveConfig(localConfig).unwrap();
      setMessage("Work week saved successfully.");
    } catch (e) {
      setMessage("Failed to save work week.");
    }
  }

  return (
    <div className="h-full bg-[#f5f6fa] px-6 py-4 overflow-y-auto">
      {/* Top nav */}
      <div className="flex items-center gap-2 mb-4">
        {TABS.map((tab) => {
          const isMenuTab = "isMenu" in tab && tab.isMenu;
          const menuItems = isMenuTab ? tab.menu : undefined;
          const isActive =
            tab.key === activeTabKey && tab.label === "Configure";

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
                    // ✅ guard so TS knows `path` exists
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
            Work Week
          </h2>
        </div>

        <div className="px-7 pt-5 pb-6 text-[12px] space-y-4">
          {DAYS.map((d) => (
            <div key={d.key} className="flex items-center gap-6 max-w-md">
              <div className="w-32">
                <label className={labelCls}>{d.label}*</label>
              </div>
              <div className="flex-1">
                <select
                  className="w-40 h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]"
                  value={localConfig[d.key] as WorkDayKind}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      [d.key]: e.target.value as WorkDayKind,
                    }))
                  }
                >
                  {OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <p className="text-[10px] text-slate-400 mt-2">* Required</p>

          {isLoading && (
            <p className="text-[11px] text-slate-500">Loading config...</p>
          )}
          {message && (
            <p className="text-[11px] text-emerald-600">{message}</p>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
