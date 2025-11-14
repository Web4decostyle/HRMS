// frontend/src/pages/dashboard/widgets/QuickLaunchWidget.tsx
import { useNavigate } from "react-router-dom";
import BaseWidget from "./BaseWidget";

const ACTIONS = [
  { key: "assignLeave", label: "Assign Leave", path: "/leave/assign" },
  { key: "leaveList", label: "Leave List", path: "/leave/list" },
  { key: "timesheets", label: "Timesheets", path: "/time/timesheets" },
  { key: "applyLeave", label: "Apply Leave", path: "/leave/apply" },
  { key: "myLeave", label: "My Leave", path: "/leave/my" },
  { key: "myTimesheet", label: "My Timesheet", path: "/time/my-timesheet" },
];

export default function QuickLaunchWidget() {
  const navigate = useNavigate();

  function handleClick(path: string) {
    // For now, these routes may not exist.
    // Router will fallback, which is fine until we implement them.
    navigate(path);
  }

  return (
    <BaseWidget title="Quick Launch" icon="⚡" empty={ACTIONS.length === 0}>
      <div className="grid grid-cols-3 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => handleClick(action.path)}
            className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition text-xs text-slate-700"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-base">
              ⚙
            </div>
            <span className="text-[11px] text-center leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </BaseWidget>
  );
}
