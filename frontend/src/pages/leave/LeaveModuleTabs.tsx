// frontend/src/pages/leave/LeaveModuleTabs.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectAuthRole } from "../../features/auth/selectors";
import type { Role } from "../../features/auth/authSlice";

type MenuKey = "entitlements" | "reports" | "configure" | null;

type RouteTabKey = "apply" | "my-leave" | "leave-list" | "assign-leave";
type MenuTabKey = Exclude<MenuKey, null>;

type MenuItem = { label: string; path: string };

type RouteTab = {
  key: RouteTabKey;
  label: string;
  path: string;
};

type MenuTab = {
  key: MenuTabKey;
  label: string;
  isMenu: true;
  menu: MenuItem[];
};

export type LeaveTab = RouteTab | MenuTab;

const TABS: LeaveTab[] = [
  { key: "apply", label: "Apply", path: "/leave/apply" },
  { key: "my-leave", label: "My Leave", path: "/leave/my-leave" },
  {
    key: "entitlements",
    label: "Entitlements",
    isMenu: true,
    menu: [
      { label: "Add Entitlements", path: "/leave/entitlements/add" },
      { label: "Employee Entitlements", path: "/leave/entitlements/employee" },
      { label: "My Entitlements", path: "/leave/entitlements/my" },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    isMenu: true,
    menu: [
      { label: "Leave Entitlements and Usage Report", path: "/leave/reports/entitlements-usage" },
      { label: "My Leave Entitlements and Usage Report", path: "/leave/reports/my-entitlements-usage" },
    ],
  },
  {
    key: "configure",
    label: "Configure",
    isMenu: true,
    menu: [
      { label: "Leave Period", path: "/leave/config/period" },
      { label: "Leave Types", path: "/leave/config/types" },
      { label: "Work Week", path: "/leave/config/work-week" },
      { label: "Holidays", path: "/leave/config/holidays" },
    ],
  },
  { key: "leave-list", label: "Leave List", path: "/leave" },
  { key: "assign-leave", label: "Assign Leave", path: "/leave/assign" },
];

function getVisibleTabs(role: Role | null | undefined): LeaveTab[] {
  if (role === "ADMIN" || role === "HR") return TABS;

  if (role === "SUPERVISOR") {
    return TABS.filter((t) => t.key === "apply" || t.key === "my-leave" || t.key === "leave-list");
  }

  return TABS.filter((t) => t.key === "apply" || t.key === "my-leave");
}

function isMenuTab(tab: LeaveTab): tab is MenuTab {
  return "isMenu" in tab && tab.isMenu === true;
}

export default function LeaveModuleTabs({ activeKey }: { activeKey: string }) {
  const navigate = useNavigate();
  const role = useSelector(selectAuthRole);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  const visibleTabs = useMemo(() => getVisibleTabs(role), [role]);

  return (
    <div className="flex items-center gap-2 mb-4">
      {visibleTabs.map((tab) => {
        const isActive = tab.key === activeKey;
        const menu = isMenuTab(tab);

        return (
          <div key={tab.key} className="relative">
            <button
              type="button"
              onClick={() => {
                if (menu) {
                  setOpenMenu((prev) => (prev === tab.key ? null : tab.key));
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
              {menu && <span className="ml-1 text-[10px]">▼</span>}
            </button>

            {menu && openMenu === tab.key && (
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
  );
}
