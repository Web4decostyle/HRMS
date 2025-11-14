// frontend/src/components/Sidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useGetMenuQuery,
  MenuItem,
} from "../features/navigation/navigationApi";

export default function Sidebar() {
  const { data, isLoading } = useGetMenuQuery();
  const location = useLocation();

  const items: MenuItem[] = data?.items ?? [];

  const baseItemClasses =
    "flex items-center gap-3 px-4 py-2.5 text-sm rounded-r-full transition-colors";

  function renderIcon(icon?: string) {
    // Very simple icon mapping (you can swap to lucide-react later)
    switch (icon) {
      case "home":
        return "🏠";
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
      {/* Logo / Brand bar */}
      <div className="h-14 px-4 flex items-center border-b border-slate-200 bg-gradient-to-r from-green-50 via-white to-white">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-8 h-8 rounded-2xl bg-green-500 flex items-center justify-center text-xs font-bold text-white shadow-md"
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

          const path = item.path; // guaranteed string in this block

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

      {/* Footer strip */}
      <div className="h-10 px-4 flex items-center border-t border-slate-200 text-[11px] text-slate-400 bg-slate-50">
        <span className="truncate">
          © {new Date().getFullYear()} DecoStyle
        </span>
      </div>
    </motion.aside>
  );
}
