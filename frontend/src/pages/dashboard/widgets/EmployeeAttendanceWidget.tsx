// frontend/src/pages/dashboard/widgets/EmployeeAttendanceWidget.tsx
import BaseWidget from "./BaseWidget";

export default function EmployeeAttendanceWidget() {
  // Later: pull real data via RTK Query
  const isClockedIn = false;

  return (
    <BaseWidget title="Time at Work" icon="⏱">
      <div className="space-y-3">
        <div className="text-xs text-slate-500 uppercase tracking-wide">
          Today
        </div>
        <div className="text-3xl font-semibold text-slate-800">
          00:00
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div>In: —</div>
          <div>Out: —</div>
        </div>
        <button
          className={`mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium ${
            isClockedIn
              ? "bg-rose-50 text-rose-600 border border-rose-100"
              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
          }`}
        >
          {isClockedIn ? "Clock Out" : "Clock In"}
        </button>
      </div>
    </BaseWidget>
  );
}
