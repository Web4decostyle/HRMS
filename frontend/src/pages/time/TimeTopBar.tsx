// frontend/src/pages/time/TimeTopBar.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { useSelector } from "react-redux";
import type { Role } from "../../features/auth/authSlice";

type MenuKey = "timesheets" | "attendance" | "reports" | "projects";

const pillBase =
  "inline-flex items-center gap-2 px-5 py-2 text-[13px] font-semibold rounded-full border border-transparent transition-colors";

const dropdownItemClasses =
  "block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-green-50";

// ✅ Use this selector pattern even if you don't have a selector file
function selectRole(state: any): Role {
  return (state?.auth?.user?.role as Role) ?? "ESS";
}

type MenuItem = {
  label: string;
  to: string;
  roles?: Role[]; // if present, only these roles can see
};

type MenuGroup = {
  key: MenuKey;
  label: string;
  roles?: Role[]; // if present, group only for these roles
  items: MenuItem[];
};

export default function TimeTopBar() {
  const location = useLocation();
  const role = useSelector(selectRole);
  const isAdminLike = role === "ADMIN" || role === "HR" || role === "SUPERVISOR";

  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const menus = useMemo<MenuGroup[]>(() => {
    const all: MenuGroup[] = [
      {
        key: "timesheets",
        label: "Timesheets",
        items: [
          { label: "My Timesheets", to: "/time" },
          {
            label: "Employee Timesheets",
            to: "/time/timesheets/employee",
            roles: ["ADMIN", "HR", "SUPERVISOR"],
          },
        ],
      },
      {
        key: "attendance",
        label: "Attendance",
        items: [
          { label: "My Records", to: "/time/attendance/my-records" },
          { label: "Punch In/Out", to: "/time/attendance/punch-in" },
          {
            label: "Employee Records",
            to: "/time/attendance/excel-import",
            roles: ["ADMIN", "HR", "SUPERVISOR"],
          },
          {
            label: "Configuration",
            to: "/time/attendance/config",
            roles: ["ADMIN", "HR"],
          },
        ],
      },

      // ✅ Reports should be admin-like only
      {
        key: "reports",
        label: "Reports",
        roles: ["ADMIN", "HR", "SUPERVISOR"],
        items: [
          { label: "Project Reports", to: "/time/reports/projects" },
          { label: "Employee Reports", to: "/time/reports/employees" },
          { label: "Attendance Summary", to: "/time/reports/attendance-summary" },
        ],
      },

      // ✅ Project Info should be admin-like only
      {
        key: "projects",
        label: "Project Info",
        roles: ["ADMIN", "HR"],
        items: [
          { label: "Customers", to: "/time/project-info/customers" },
          { label: "Projects", to: "/time/project-info/projects" },
        ],
      },
    ];

    // filter groups and items by role
    const filtered = all
      .filter((g) => !g.roles || g.roles.includes(role))
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => !it.roles || it.roles.includes(role)),
      }))
      .filter((g) => g.items.length > 0);

    return filtered;
  }, [role]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ If current open menu disappears after role-filtering, close it
  useEffect(() => {
    if (openMenu && !menus.some((m) => m.key === openMenu)) setOpenMenu(null);
  }, [openMenu, menus]);

  return (
    <div className="mb-6" ref={wrapperRef}>
      <div className="inline-flex gap-1.5 bg-green-500 rounded-full px-3 py-2 shadow-sm">
        {menus.map((menu) => {
          const isGroupActive = menu.items.some((item) =>
            location.pathname.startsWith(item.to)
          );
          const isOpen = openMenu === menu.key;

          const pillClasses = isGroupActive
            ? `${pillBase} bg-white text-green-700 shadow-sm`
            : `${pillBase} text-white/95 hover:bg-white/20`;

          return (
            <div key={menu.key} className="relative">
              <button
                type="button"
                className={pillClasses}
                onClick={() =>
                  setOpenMenu((prev) => (prev === menu.key ? null : menu.key))
                }
              >
                <span>{menu.label}</span>
                <FiChevronDown
                  className={`text-[12px] transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1">
                  {menu.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpenMenu(null)}
                      className={({ isActive }) =>
                        isActive
                          ? `${dropdownItemClasses} bg-green-50 font-semibold text-green-700`
                          : dropdownItemClasses
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Optional: small helper for debugging roles */}
      {/* <div className="mt-2 text-xs text-slate-400">Role: {role} {isAdminLike ? "(admin-like)" : ""}</div> */}
    </div>
  );
}