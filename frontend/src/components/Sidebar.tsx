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

  const [collapsed, setCollapsed] = React.useState<boolean>(true);
  const expanded = !collapsed;

  // ✅ Notifications (top level page)
  const notifItem: MenuItem = {
    key: "notifications",
    label: "Notifications",
    icon: "bell",
    path: "/notifications",
  };

  // ✅ Extra items
  const learningItem: MenuItem = {
    key: "learningSkills",
    label: "Learning & Skills ",
    icon: "book",
    path: "/learning",
  };

  const payrollItem: MenuItem = {
    key: "payrollSalarySlip",
    label: "Payroll & Salary-slip",
    icon: "receipt",
    path: "/payroll",
  };

  const reportsItem: MenuItem = {
    key: "reports",
    label: "Reports",
    icon: "chart",
    path: "/reports",
    roles: ["ADMIN", "HR"] as any,
  };

  // ❌ remove approvals everywhere (even if backend sends it)
  const shouldHideItem = (item: MenuItem) => {
    const key = String(item.key || "").toLowerCase().trim();
    const label = String(item.label || "").toLowerCase().trim();
    const path = String(item.path || "").toLowerCase().trim();

    if (key === "approvals") return true;
    if (label === "approvals") return true;
    if (path === "/approvals") return true;
    if (path === "/admin/approvals") return true;
    if (path.startsWith("/admin/approvals/")) return true;

    return false;
  };

  // ✅ Build merged menu
  const merged: MenuItem[] = (() => {
    const fromApi = (data?.items ?? [])
      .map((x) => {
        // rename Claim -> Request Center (keep path)
        if (
          x?.path === "/claim" ||
          x?.key === "claim" ||
          String(x?.label || "").toLowerCase().trim() === "claim"
        ) {
          return { ...x, label: "Request Center" };
        }
        return x;
      })
      .filter((x) => !shouldHideItem(x));

    const hasItem = (key: string, path: string) =>
      fromApi.some((x) => x.key === key || x.path === path);

    // Insert Notifications below My Info (if not present)
    const hasNotif = fromApi.some(
      (x) => x.key === "notifications" || x.path === "/notifications",
    );

    let next = fromApi;

    if (!hasNotif) {
      const idx = fromApi.findIndex(
        (x) =>
          x.key === "myInfo" || x.path === "/my-info" || x.label === "My Info",
      );
      if (idx >= 0) {
        next = [
          ...fromApi.slice(0, idx + 1),
          notifItem,
          ...fromApi.slice(idx + 1),
        ];
      } else {
        next = [...fromApi, notifItem];
      }
    }

    const additions: MenuItem[] = [];
    if (!hasItem(learningItem.key, learningItem.path!)) additions.push(learningItem);
    if (!hasItem(payrollItem.key, payrollItem.path!)) additions.push(payrollItem);
    if (!hasItem(reportsItem.key, reportsItem.path!)) additions.push(reportsItem);

    return additions.length ? [...next, ...additions] : next;
  })();

  // ✅ Defensive RBAC filter
  const filterByRole = (list: MenuItem[]): MenuItem[] => {
    return list
      .filter((item) => {
        if (shouldHideItem(item)) return false;
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

  // 🔒 ESS_VIEWER allowed pages
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
      "/learning",
      "/payroll",
    ];
    return allowedPaths.some((p) => path === p || path.startsWith(p + "/"));
  });

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
      case "book":
        return "📚";
      case "receipt":
        return "🧾";
      case "chart":
        return "📊";
      default:
        return "•";
    }
  }

  return (
    <motion.aside
      className={[
        "relative flex flex-col",
        // ✅ FIXED so it won't scroll with page
        "h-screen fixed top-0 left-0 z-[50]",
        "border-r border-slate-200",
        "bg-white",
        "overflow-x-hidden",
      ].join(" ")}
      animate={{ width: expanded ? 232 : 68 }}
      transition={{ type: "spring", stiffness: 190, damping: 24 }}
      style={{ overflowY: "hidden", overflowX: "hidden", overflow: "visible" }}
    >
      {/* Header */}
      <div className="h-14 px-2.5 flex items-center border-b border-slate-200 bg-gradient-to-r from-green-50 via-white to-white">
        <div className="flex items-center gap-2.5 w-full">
          <motion.div
            className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center text-[11px] font-bold text-white shadow-sm shrink-0"
            whileHover={{ rotate: 3, scale: 1.03 }}
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
                <div className="text-[13px] font-semibold text-slate-900 truncate">
                  DecoStyle
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {role.replace("-", " ")}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className={[
          "absolute z-[60]",
          "top-[72px]",
          "-right-5",
          "h-8 w-8 rounded-xl",
          "bg-white border border-slate-200 shadow-md",
          "flex items-center justify-center",
          "hover:bg-slate-50 transition",
          "focus:outline-none focus:ring-2 focus:ring-green-300",
        ].join(" ")}
        title={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="text-slate-700 text-base leading-none"
        >
          ❯
        </motion.span>
      </button>

      {/* Menu */}
      <nav className="relative flex-1 px-2 py-2 space-y-0.5 overflow-y-hidden overflow-x-hidden">  
        {isLoading && (
          <div className="px-2 py-2 text-xs text-slate-400 space-y-2">
            <div className="h-3 w-16 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-3 w-20 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-3 w-14 bg-slate-100 rounded-full animate-pulse" />
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="px-2 py-2 text-xs text-slate-400">
            No menu items available.
          </div>
        )}

        {items.map((item, index) => {
          if (!item.path) {
            return (
              <AnimatePresence key={item.key} initial={false}>
                {expanded && (
                  <motion.div
                    className="px-2 pt-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.16em]"
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
                  isActive || (path !== "/" && location.pathname.startsWith(path));

                const wrapper = [
                  "group relative",
                  "flex items-center gap-2.5",
                  "px-2 py-2",
                  "rounded-xl",
                  "transition-all duration-150",
                  expanded ? "mx-0.5" : "mx-0.5 justify-center",
                  active
                    ? "bg-green-50 text-green-700 ring-1 ring-green-100"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ");

                const iconChip = [
                  "h-8 w-8 rounded-lg",
                  "flex items-center justify-center",
                  "transition-colors",
                  active ? "bg-green-100" : "bg-slate-100 group-hover:bg-slate-200",
                  "shrink-0",
                ].join(" ");

                return (
                  <motion.div
                    className={wrapper}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 22,
                      delay: index * 0.012,
                    }}
                    title={!expanded ? item.label : undefined}
                  >
                    <span
                      className={[
                        "absolute left-0 top-1/2 -translate-y-1/2",
                        "h-6 w-1 rounded-full",
                        active ? "bg-green-400" : "bg-transparent",
                      ].join(" ")}
                    />

                    <span className={iconChip}>
                      <span className="text-[16px] leading-none">
                        {renderIcon(item.icon)}
                      </span>
                    </span>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.span
                          key="label"
                          className="truncate text-[12px] font-medium"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.12 }}
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
      <div className="h-10 px-3 flex items-center border-t border-slate-200 text-[10px] text-slate-400 bg-white">
        <span className="truncate">
          {expanded ? `© ${new Date().getFullYear()} DecoStyle` : "©"}
        </span>
      </div>
    </motion.aside>
  );
}