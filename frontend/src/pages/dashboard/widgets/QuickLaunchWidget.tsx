import BaseWidget from "./BaseWidget";
import { useNavigate } from "react-router-dom";

const items = [
  { label: "Assign Leave", to: "/leave/assign", icon: "👤" },
  { label: "Leave List", to: "/leave", icon: "🗒️" },
  { label: "Timesheets", to: "/time", icon: "⏱️" },
  { label: "Apply Leave", to: "/leave/apply", icon: "✅" },
  { label: "My Leave", to: "/leave/my-leave", icon: "📅" },
  { label: "My Timesheet", to: "/time", icon: "🕓" },
];

export default function QuickLaunchWidget() {
  const nav = useNavigate();

  return (
    <BaseWidget title="Quick Launch" icon="⚡">
      <div className="grid grid-cols-3 gap-5">
        {items.map((x) => (
          <button
            key={x.label}
            type="button"
            onClick={() => nav(x.to)}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-xl">
              {x.icon}
            </div>
            <div className="text-[11px] text-slate-500 text-center">
              {x.label}
            </div>
          </button>
        ))}
      </div>
    </BaseWidget>
  );
}
