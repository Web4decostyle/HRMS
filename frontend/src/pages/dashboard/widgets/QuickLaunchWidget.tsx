import BaseWidget from "./BaseWidget";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuthRole } from "../../../features/auth/selectors";
import type { Role } from "../../../features/auth/authSlice";

type QuickItem = {
  label: string;
  to: string;
  icon: string;
  roles?: Role[]; // if present, only show for these roles
};

const items: QuickItem[] = [
  // Admin/HR
  { label: "Assign Leave", to: "/leave/assign", icon: "👤", roles: ["ADMIN", "HR"] },
  { label: "Leave List", to: "/leave/list", icon: "🗒️", roles: ["ADMIN", "HR", "SUPERVISOR"] },

  // Common / ESS
  { label: "Apply Leave", to: "/leave/apply", icon: "✅" },
  { label: "My Leave", to: "/leave/my-leave", icon: "📅" },
  { label: "My Timesheet", to: "/time", icon: "🕓" },
];

export default function QuickLaunchWidget() {
  const nav = useNavigate();
  const role = useSelector(selectAuthRole) ?? "ESS";

  const visibleItems = items.filter((x) => {
    if (!x.roles || x.roles.length === 0) return true;
    return x.roles.includes(role as Role);
  });

  return (
    <BaseWidget title="Quick Launch" icon="⚡">
      <div className="grid grid-cols-3 gap-5">
        {visibleItems.map((x) => (
          <button
            key={x.label}
            type="button"
            onClick={() => nav(x.to)}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-xl">
              {x.icon}
            </div>
            <div className="text-[11px] text-slate-500 text-center">{x.label}</div>
          </button>
        ))}
      </div>
    </BaseWidget>
  );
}