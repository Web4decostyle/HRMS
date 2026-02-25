// frontend/src/components/Sidebar.tsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useGetMenuQuery, MenuItem } from "../features/navigation/navigationApi";
import { selectAuthRole } from "../features/auth/selectors";

export default function Sidebar() {
  const { data, isLoading } = useGetMenuQuery();
  const location = useLocation();
  const role = useSelector(selectAuthRole) ?? "ESS";
  const isViewOnly = role === "ESS_VIEWER";

  // ✅ ONLY CLICK TOGGLE (no hover)
  const [collapsed, setCollapsed] = React.useState<boolean>(true);
  const expanded = !collapsed;

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

    const hasNotif = fromApi.some(
      (x) => x.key === "notifications" || x.path === "/notifications",
    );
    if (hasNotif) return fromApi;

    const idx = fromApi.findIndex(
      (x) =>
        x.key === "myInfo" || x.path === "/my-info" || x.label === "My Info",
    );

    if (idx >= 0) {
      return [
        ...fromApi.slice(0, idx + 1),
        notifItem,
        ...fromApi.slice(idx + 1),
      ];
    }
    return [...fromApi, notifItem];
  })();

  // ✅ Defensive RBAC filter (in case backend returns unfiltered items)
  const filterByRole = (list: MenuItem[]): MenuItem[] => {
    return list
      .filter((item) => {
        if (!item.roles || item.roles.length === 0) return true;
        return item.roles.includes(role as any);
      })
      .map((item) => {
        if (!item.children || item.children.length === 0) return item;
        const children = filterByRole(item.children);
        return { ...item, children };
      })
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
      "/",
      "/my-info",
      "/notifications",
      "/leave",
      "/time",
      "/directory",
      "/claim",
      "/buzz",
    ];
    return allowedPaths.some((p) => path === p || path.startsWith(p + "/"));
  });

  const baseItemClasses =
    "flex items-center gap-3 px-3 py-2.5 text-sm rounded-r-full transition-colors";

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
      case "check":
        return "✅";
      case "building":
        return "🏢";
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
      className={[
        "relative bg-white text-slate-800 flex flex-col border-r border-slate-200 shadow-sm",
        "h-screen sticky top-0",
        "overflow-x-hidden", // ✅ remove bottom horizontal scrollbar
      ].join(" ")}
      animate={{ width: expanded ? 224 : 64 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      style={{
        overflowY: "hidden",
        overflowX: "hidden",
        overflow: "visible", // ✅ allow arrow to float outside
      }}
    >
      {/* Header / Logo */}
      <div className="h-14 px-2 flex items-center border-b border-slate-200 bg-gradient-to-r from-green-50 via-white to-white">
        <div className="flex items-center gap-2 w-full">
          <motion.div
            className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            title="DecoStyle"
          >
            D
          </motion.div>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="title"
                className="leading-tight flex-1 min-w-0"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
              >
                <div className="text-sm font-semibold text-slate-900 tracking-tight truncate">
                  DecoStyle
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {role.replace("-", " ")}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ✅ Floating Arrow (OUTSIDE nav) */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className={[
          "absolute z-[60]",
          "top-[74px]", // ✅ a bit below header, above first item
          "-right-5", // ✅ more outside (comes onto page content)
          "h-9 w-9 rounded-xl",
          "bg-white border border-slate-200 shadow-lg",
          "flex items-center justify-center",
          "hover:bg-slate-50 transition",
          "focus:outline-none focus:ring-2 focus:ring-green-300",
        ].join(" ")}
        title={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="text-slate-700 text-lg leading-none"
        >
          ❯
        </motion.span>
      </button>

      {/* Menu */}
      <nav className="relative flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {isLoading && (
          <div className="px-3 py-2 text-xs text-slate-400 space-y-2">
            <div className="h-3 w-10 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-3 w-14 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-3 w-12 bg-slate-100 rounded-full animate-pulse" />
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="px-3 py-2 text-xs text-slate-400">
            No menu items available.
          </div>
        )}

        {items.map((item, index) => {
          if (!item.path) {
            return (
              <AnimatePresence key={item.key} initial={false}>
                {expanded && (
                  <motion.div
                    className="px-4 pt-4 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em]"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.div>
                )}
              </AnimatePresence>
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
                    ? "bg-green-100 text-green-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  expanded ? "mx-2" : "mx-1 justify-center",
                ].join(" ");

                return (
                  <motion.div
                    className={itemClasses}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: index * 0.02,
                    }}
                    title={!expanded ? item.label : undefined}
                  >
                    <span className="w-6 flex justify-center text-base">
                      {renderIcon(item.icon)}
                    </span>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.span
                          key="label"
                          className="truncate"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.15 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              }}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="h-10 px-3 flex items-center border-t border-slate-200 text-[11px] text-slate-400 bg-slate-50">
        <span className="truncate">
          {expanded ? `© ${new Date().getFullYear()} DecoStyle` : "©"}
        </span>
      </div>
    </motion.aside>
  );
}