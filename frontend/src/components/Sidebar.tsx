// frontend/src/components/Sidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useGetMenuQuery, MenuItem } from "../features/navigation/navigationApi";
import { selectAuthRole } from "../features/auth/selectors";

export default function Sidebar() {
  const { data, isLoading } = useGetMenuQuery();
  const location = useLocation();
  const role = useSelector(selectAuthRole) ?? "ESS";
  const isViewOnly = role === "ESS_VIEWER";

  // ✅ Notifications menu item (routes to NotificationsPage)
  const notifItem: MenuItem = {
    key: "notifications",
    label: "Notifications",
    icon: "bell",
    path: "/notifications",
  };

  // ✅ Merge menu, inserting Notifications BELOW My Info
  const merged: MenuItem[] = (() => {
    const fromApi = data?.items ?? [];

    // if backend already sends notifications, don't add again
    const hasNotif = fromApi.some(
      (x) => x.key === "notifications" || x.path === "/notifications"
    );
    if (hasNotif) return fromApi;

    // find My Info index
    const idx = fromApi.findIndex(
      (x) => x.key === "myInfo" || x.path === "/my-info" || x.label === "My Info"
    );

    // if My Info exists, insert after it; else append at end
    if (idx >= 0) {
      return [...fromApi.slice(0, idx + 1), notifItem, ...fromApi.slice(idx + 1)];
    }
    return [...fromApi, notifItem];
  })();

  // ✅ Defensive RBAC filter (in case backend returns unfiltered items)
  const filterByRole = (list: MenuItem[]): MenuItem[] => {
    return list
      .filter((item) => {
        // If the item doesn't declare roles, keep it.
        if (!item.roles || item.roles.length === 0) return true;
        return item.roles.includes(role as any);
      })
      .map((item) => {
        if (!item.children || item.children.length === 0) return item;
        const children = filterByRole(item.children);
        return { ...item, children };
      })
      // If a parent ends up with no children and no path, drop it
      .filter((item) => {
        if (item.path) return true;
        if (item.children && item.children.length > 0) return true;
        return false;
      });
  };

  const roleFiltered = filterByRole(merged);

  // 🔒 ROLE-BASED FILTER (NO UI CHANGE)
  const items: MenuItem[] = roleFiltered.filter((item) => {
    if (!isViewOnly) return true;

    if (!item.path) return true;

    const path = item.path;

    const allowedPaths = [
      "/", // Dashboard
      "/my-info",
      "/notifications", // ✅ allow notifications for ESS_VIEWER too
      "/leave",
      "/time",
      "/directory",
      "/claim",
      "/buzz",
    ];

    return allowedPaths.some((p) => path === p || path.startsWith(p + "/"));
  });

  const baseItemClasses =
    "flex items-center gap-3 px-4 py-2.5 text-sm rounded-r-full transition-colors";

  function renderIcon(icon?: string) {
    switch (icon) {
      case "home":
        return "🏠";
      case "bell":
        return "🔔";
      case "shield":
        return "🛡";
      case "users":
        return "👥";
      case "calendar":
        return "📅";
      case "clock":
        return "⏱";
      case "briefcase":
        return "💼";
      case "id":
        return "🪪";
      case "star":
        return "⭐";
      case "directory":
        return "📇";
      case "wrench":
        return "🔧";
      case "wallet":
        return "👛";
      case "buzz":
        return "💬";
      default:
        return "•";
    }
  }

  return (
    <motion.aside
      className="w-56 bg-white text-slate-800 flex flex-col border-r border-slate-200 shadow-sm"
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
    >
      {/* Logo */}
      <div className="h-14 px-4 flex items-center border-b border-slate-200 bg-gradient-to-r from-red-50 via-white to-white">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-8 h-8 rounded-2xl bg-red-500 flex items-center justify-center text-xs font-bold text-white shadow-md"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            D
          </motion.div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900 tracking-tight">
              DecoStyle
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        {isLoading && (
          <div className="px-4 py-2 text-xs text-slate-400 space-y-2">
            <div className="h-3 w-24 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-3 w-32 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-3 w-28 bg-slate-100 rounded-full animate-pulse" />
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="px-4 py-2 text-xs text-slate-400">
            No menu items available.
          </div>
        )}

        {items.map((item, index) => {
          if (!item.path) {
            return (
              <div
                key={item.key}
                className="px-4 pt-4 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em]"
              >
                {item.label}
              </div>
            );
          }

          const path = item.path;

          return (
            <NavLink key={item.key} to={path} className="block">
              {({ isActive }) => {
                const active =
                  isActive ||
                  (path !== "/" && location.pathname.startsWith(path));

                const itemClasses = [
                  baseItemClasses,
                  active
                    ? "bg-red-100 text-red-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ");

                return (
                  <motion.div
                    className={itemClasses}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4, scale: 1.02 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: index * 0.02,
                    }}
                  >
                    <span className="w-6 flex justify-center text-base">
                      {renderIcon(item.icon)}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </motion.div>
                );
              }}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="h-10 px-4 flex items-center border-t border-slate-200 text-[11px] text-slate-400 bg-slate-50">
        <span className="truncate">© {new Date().getFullYear()} DecoStyle</span>
      </div>
    </motion.aside>
  );
}