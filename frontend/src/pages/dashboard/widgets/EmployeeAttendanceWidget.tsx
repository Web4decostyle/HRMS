// frontend/src/pages/dashboard/widgets/EmployeeAttendanceWidget.tsx
import React from "react";
import { useGetTimeAtWorkQuery } from "../../../features/dashboard/dashboardApi"; // adjust if your path differs

type DayItem =
  | {
      date?: string;
      day?: string;
      hours?: number;
      minutes?: number;
      totalMinutes?: number;
      status?: string;
    }
  | any;

export default function EmployeeAttendanceWidget() {
  const { data, isLoading, isError } = useGetTimeAtWorkQuery();

  // ✅ guarantee array
  const week: DayItem[] = Array.isArray((data as any)?.week)
    ? (data as any).week
    : Array.isArray(data)
    ? (data as any)
    : [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-800">Attendance</div>
        <div className="text-xs text-slate-500 mt-2">Loading…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-800">Attendance</div>
        <div className="text-xs text-green-500 mt-2">Failed to load</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800">
          Employee Attendance
        </div>
        <div className="text-[11px] text-slate-500">This Week</div>
      </div>

      {week.length === 0 ? (
        <div className="text-xs text-slate-500 mt-3">
          No attendance data available.
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {week.map((d: any, idx: number) => {
            const label = d?.day || d?.date || `Day ${idx + 1}`;
            const mins =
              typeof d?.totalMinutes === "number"
                ? d.totalMinutes
                : (Number(d?.hours || 0) * 60 + Number(d?.minutes || 0));

            const hours = Math.floor(mins / 60);
            const minutes = mins % 60;

            return (
              <div
                key={d?._id || d?.date || idx}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2"
              >
                <div className="text-xs font-medium text-slate-700">
                  {label}
                </div>
                <div className="text-xs text-slate-600">
                  {hours}h {minutes}m
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
