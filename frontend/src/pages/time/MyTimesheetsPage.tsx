import { useState } from "react";
import {
  useGetMyTimesheetsQuery,
  useCreateTimesheetMutation,
} from "../../features/time/timeApi";

export default function MyTimesheetsPage() {
  const { data: timesheets = [], isLoading } = useGetMyTimesheetsQuery();
  const [createTimesheet, { isLoading: creating }] =
    useCreateTimesheetMutation();

  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!periodStart || !periodEnd) return;
    await createTimesheet({ periodStart, periodEnd }).unwrap();
    setPeriodStart("");
    setPeriodEnd("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          My Timesheets
        </h2>
        <p className="text-sm text-slate-500">
          View and create timesheets for your work periods.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-wrap gap-3 items-end bg-white p-4 rounded-xl border border-slate-200"
      >
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Period Start
          </label>
          <input
            type="date"
            className="border rounded-md px-2 py-1 text-sm"
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
            className="border rounded-md px-2 py-1 text-sm"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
          />
        </div>
        <button
          disabled={creating}
          className="px-3 py-1.5 rounded-md bg-orange-500 text-white text-sm disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Timesheet"}
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2">Period</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Entries</th>
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
            {timesheets.map((t) => (
              <tr key={t._id} className="border-t">
                <td className="px-4 py-2">
                  {t.periodStart.slice(0, 10)} – {t.periodEnd.slice(0, 10)}
                </td>
                <td className="px-4 py-2">{t.status}</td>
                <td className="px-4 py-2">{t.entries?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
