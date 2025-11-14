// frontend/src/pages/time/TimePage.tsx
import { useState } from "react";
import {
  useGetMyTimesheetsQuery,
  useGetMyAttendanceQuery,
  useClockInMutation,
  useClockOutMutation,
} from "../../features/time/timeApi";

export default function TimePage() {
  const [tab, setTab] = useState<"timesheets" | "attendance">("timesheets");

  const { data: timesheets } = useGetMyTimesheetsQuery();
  const { data: attendance } = useGetMyAttendanceQuery();
  const [clockIn, { isLoading: clockingIn }] = useClockInMutation();
  const [clockOut, { isLoading: clockingOut }] = useClockOutMutation();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">
        Time · Timesheets & Attendance
      </h1>

      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setTab("timesheets")}
          className={`px-3 py-1.5 rounded-full border ${
            tab === "timesheets"
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white text-slate-600 border-slate-200"
          }`}
        >
          My Timesheets
        </button>
        <button
          onClick={() => setTab("attendance")}
          className={`px-3 py-1.5 rounded-full border ${
            tab === "attendance"
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white text-slate-600 border-slate-200"
          }`}
        >
          My Attendance
        </button>
      </div>

      {tab === "timesheets" && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Recent Timesheets
          </h2>
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 border-b">
              <tr>
                <th className="py-1">Period</th>
                <th className="py-1">Status</th>
                <th className="py-1 text-right">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {timesheets?.map((ts) => {
                const total = ts.entries.reduce(
                  (sum, e) => sum + (e.hours || 0),
                  0
                );
                return (
                  <tr key={ts._id} className="border-b last:border-0">
                    <td className="py-1">
                      {ts.periodStart.slice(0, 10)} –{" "}
                      {ts.periodEnd.slice(0, 10)}
                    </td>
                    <td className="py-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
                        {ts.status}
                      </span>
                    </td>
                    <td className="py-1 text-right">{total}</td>
                  </tr>
                );
              })}
              {!timesheets?.length && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-3 text-center text-slate-400 text-xs"
                  >
                    No timesheets yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {tab === "attendance" && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Attendance History
            </h2>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => clockIn().unwrap()}
                disabled={clockingIn}
                className="px-3 py-1.5 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                Clock In
              </button>
              <button
                onClick={() => clockOut().unwrap()}
                disabled={clockingOut}
                className="px-3 py-1.5 rounded-md bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
              >
                Clock Out
              </button>
            </div>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 border-b">
              <tr>
                <th className="py-1">Date</th>
                <th className="py-1">In</th>
                <th className="py-1">Out</th>
                <th className="py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance?.map((a) => (
                <tr key={a._id} className="border-b last:border-0">
                  <td className="py-1">{a.date.slice(0, 10)}</td>
                  <td className="py-1">
                    {new Date(a.inTime).toLocaleTimeString()}
                  </td>
                  <td className="py-1">
                    {a.outTime
                      ? new Date(a.outTime).toLocaleTimeString()
                      : "—"}
                  </td>
                  <td className="py-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!attendance?.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-3 text-center text-slate-400 text-xs"
                  >
                    No attendance records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
