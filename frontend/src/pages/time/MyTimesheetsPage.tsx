// frontend/src/pages/time/MyTimesheetsPage.tsx
import { FormEvent, useState } from "react";
import {
  useGetMyTimesheetsQuery,
  useCreateTimesheetMutation,
} from "../../features/time/timeApi";

import TimeTopBar from "./TimeTopBar";

/** ---------------------------- My Timesheets page content ---------------------------- */

export default function MyTimesheetsPage() {
  const { data: timesheets = [], isLoading } = useGetMyTimesheetsQuery();
  const [createTimesheet, { isLoading: creating }] =
    useCreateTimesheetMutation();

  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

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

  return (
    <div className="space-y-6">
      <TimeTopBar />

      {/* Page heading */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800">My Timesheets</h2>
        <p className="text-sm text-slate-500">
          View and create timesheets for your work periods.
        </p>
      </div>

      {/* Card: create new timesheet / select period */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Select Timesheet Period
        </h3>

        <form
          onSubmit={handleCreate}
          className="flex flex-wrap gap-3 items-end"
        >
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Period Start
            </label>
            <input
              type="date"
              className="border border-slate-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Period End
            </label>
            <input
              type="date"
              className="border border-slate-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
          <button
            disabled={creating}
            className="px-4 py-2 rounded-full bg-lime-500 text-white text-xs font-semibold hover:bg-lime-600 disabled:opacity-50"
          >
            {creating ? "Creating..." : "View / Create Timesheet"}
          </button>
        </form>

        <p className="text-[11px] text-slate-400">* Required</p>
      </section>

      {/* Card: timesheets list */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">
            My Timesheets
          </h3>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Timesheet Period</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Entries</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-xs text-slate-400" colSpan={3}>
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading && timesheets.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-xs text-slate-400" colSpan={3}>
                  No timesheets yet.
                </td>
              </tr>
            )}

            {timesheets.map((t: any) => (
              <tr key={t._id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  {t.periodStart?.slice(0, 10)} – {t.periodEnd?.slice(0, 10)}
                </td>
                <td className="px-4 py-2 text-xs uppercase text-slate-600">
                  {t.status}
                </td>
                <td className="px-4 py-2 text-xs">{t.entries?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
