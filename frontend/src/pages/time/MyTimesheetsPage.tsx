// frontend/src/pages/time/MyTimesheetsPage.tsx
import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTimesheetMutation, useGetMyTimesheetsQuery } from "../../features/time/timeApi";
import TimeTopBar from "./TimeTopBar";

export default function MyTimesheetsPage() {
  const navigate = useNavigate();
  const { data: timesheets = [], isLoading } = useGetMyTimesheetsQuery();
  const [createTimesheet, { isLoading: creating }] = useCreateTimesheetMutation();

  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const canSubmit = Boolean(periodStart && periodEnd) && !creating;

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!periodStart || !periodEnd) return;

    await createTimesheet({
      periodStart,
      periodEnd,
      entries: [],
    }).unwrap();

    setPeriodStart("");
    setPeriodEnd("");
  }

  const total = useMemo(() => timesheets.length, [timesheets]);

  return (
    <div className="space-y-6">
      <TimeTopBar />

      <div className="px-4 md:px-8 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">My Timesheets</h1>
              <p className="text-sm text-slate-500">Create and track your timesheets for selected work periods.</p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/time/attendance/my-records")}
              className="h-10 px-5 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              View My Attendance
            </button>
          </div>

          {/* Create */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Create / View Timesheet Period</h2>
              <div className="text-[11px] text-slate-400">Total: {total}</div>
            </div>

            <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Period Start</label>
                <input
                  type="date"
                  className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Period End</label>
                <input
                  type="date"
                  className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>

              <button
                disabled={!canSubmit}
                className={[
                  "h-11 w-full rounded-full text-sm font-semibold transition",
                  canSubmit
                    ? "bg-lime-600 text-white hover:bg-lime-700 active:scale-[0.99]"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed",
                ].join(" ")}
              >
                {creating ? "Creating..." : "View / Create"}
              </button>
            </form>

            <p className="mt-3 text-[11px] text-slate-400">* Select both start and end date.</p>
          </section>

          {/* List */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Timesheets</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your created periods appear here.</p>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Period</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td className="px-5 py-6 text-sm text-slate-500" colSpan={3}>
                        Loading…
                      </td>
                    </tr>
                  )}

                  {!isLoading && timesheets.length === 0 && (
                    <tr>
                      <td className="px-5 py-10 text-sm text-slate-500" colSpan={3}>
                        No timesheets yet.
                      </td>
                    </tr>
                  )}

                  {timesheets.map((t: any) => (
                    <tr key={t._id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-800">
                          {t.periodStart?.slice(0, 10)} – {t.periodEnd?.slice(0, 10)}
                        </div>
                        <div className="text-xs text-slate-400">ID: {t._id}</div>
                      </td>

                      <td className="px-5 py-3">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border border-slate-200 text-slate-700 bg-white">
                          {String(t.status || "DRAFT").toUpperCase()}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-right text-sm font-semibold text-slate-800">
                        {t.entries?.length ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="py-6 text-center text-xs text-slate-400">DecoStyle · Timesheets · © {new Date().getFullYear()}</div>
        </div>
      </div>
    </div>
  );
}