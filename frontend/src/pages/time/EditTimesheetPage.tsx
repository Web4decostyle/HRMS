// frontend/src/pages/time/EditTimesheetPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiChevronDown,
} from "react-icons/fi";

import TimeTopBar from "./TimeTopBar";
import {
  useGetTimesheetQuery,
  useUpdateTimesheetEntriesMutation,
  TimesheetEntry,
  Timesheet,
} from "../../features/time/timeApi";

/* ---------- Helpers ---------- */

function toDateSafe(v: any): Date | null {
  if (!v) return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function fmtISODate(v: any) {
  const d = toDateSafe(v);
  return d ? d.toISOString().slice(0, 10) : "—";
}

function weekdayShort(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

/* ---------- Editable rows ---------- */

interface EditableRow {
  clientId: string;
  project: string;
  task: string;
  hours: string[]; // length 7
}

/** helper: build rows from API timesheet */
function buildRowsFromTimesheet(ts: Timesheet): EditableRow[] {
  const start = toDateSafe((ts as any).periodStart);
  const entries = Array.isArray((ts as any).entries) ? (ts as any).entries : [];

  const rowsMap: Record<string, EditableRow> = {};

  entries.forEach((entry: any) => {
    const key = `${entry?.project || ""}__${entry?.task || ""}`;

    if (!rowsMap[key]) {
      rowsMap[key] = {
        clientId: key || `row-${Object.keys(rowsMap).length}`,
        project: entry?.project || "",
        task: entry?.task || "",
        hours: Array(7).fill(""),
      };
    }

    const row = rowsMap[key];

    if (!start) return;
    const entryDate = toDateSafe(entry?.date);
    if (!entryDate) return;

    const diffMs = entryDate.getTime() - start.getTime();
    const dayIndex = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (dayIndex < 0 || dayIndex > 6) return;

    const existing = row.hours[dayIndex];
    const sum = (Number(existing || 0) + Number(entry?.hours || 0)).toString();
    row.hours[dayIndex] = sum === "0" ? "" : sum;
  });

  const result = Object.values(rowsMap);
  if (result.length === 0) {
    result.push({
      clientId: "row-0",
      project: "",
      task: "",
      hours: Array(7).fill(""),
    });
  }
  return result;
}

export default function EditTimesheetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: timesheet, isLoading } = useGetTimesheetQuery(id!, { skip: !id });

  const [updateEntries, { isLoading: saving }] = useUpdateTimesheetEntriesMutation();

  const [rows, setRows] = useState<EditableRow[]>([
    { clientId: "row-0", project: "", task: "", hours: Array(7).fill("") },
  ]);

  // Build dynamic day headers from periodStart like screenshot (9 Mon ... 15 Sun)
  const dayCols = useMemo(() => {
    const start = toDateSafe((timesheet as any)?.periodStart);
    if (!start) {
      // fallback (no crash)
      return Array.from({ length: 7 }).map((_, i) => ({
        key: String(i),
        label: String(i + 1),
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      }));
    }
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        key: d.toISOString(),
        label: String(d.getDate()),
        day: weekdayShort(d),
      };
    });
  }, [timesheet]);

  // initial load from API
  useEffect(() => {
    if (!timesheet) return;
    setRows(buildRowsFromTimesheet(timesheet));
  }, [timesheet]);

  // ✅ FIX: never call .slice on undefined
  const periodLabel = timesheet
    ? `${fmtISODate((timesheet as any).periodStart)} - ${fmtISODate((timesheet as any).periodEnd)}`
    : "—";

  function handleChangeRow(clientId: string, field: "project" | "task", value: string) {
    setRows((prev) => prev.map((r) => (r.clientId === clientId ? { ...r, [field]: value } : r)));
  }

  function handleChangeHour(clientId: string, dayIndex: number, value: string) {
    // allow "" or decimals
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;

    setRows((prev) =>
      prev.map((r) =>
        r.clientId === clientId
          ? { ...r, hours: r.hours.map((h, i) => (i === dayIndex ? value : h)) }
          : r
      )
    );
  }

  function handleAddRow() {
    setRows((prev) => [
      ...prev,
      {
        clientId: `row-${Date.now()}`,
        project: "",
        task: "",
        hours: Array(7).fill(""),
      },
    ]);
  }

  function handleDeleteRow(clientId: string) {
    setRows((prev) => {
      const next = prev.filter((r) => r.clientId !== clientId);
      return next.length ? next : [{ clientId: "row-0", project: "", task: "", hours: Array(7).fill("") }];
    });
  }

  function handleReset() {
    if (!timesheet) return;
    setRows(buildRowsFromTimesheet(timesheet));
  }

  async function handleSave() {
    if (!id || !timesheet) return;

    const start = toDateSafe((timesheet as any).periodStart);
    if (!start) return;

    const payloadEntries: TimesheetEntry[] = [];

    rows
      // drop fully empty rows
      .filter(
        (r) => r.project.trim() || r.task.trim() || r.hours.some((h) => h && h.trim() !== "")
      )
      .forEach((row) => {
        dayCols.forEach((_, dayIndex) => {
          const raw = row.hours[dayIndex];
          if (!raw || !raw.trim()) return;

          const hours = Number(raw);
          if (!hours || hours <= 0) return;

          const date = new Date(start);
          date.setDate(start.getDate() + dayIndex);

          payloadEntries.push({
            date: date.toISOString(),
            project: row.project.trim() || undefined,
            task: row.task.trim() || undefined,
            hours,
          });
        });
      });

    await updateEntries({ id, entries: payloadEntries }).unwrap();
    navigate(-1);
  }

  return (
    <div className="space-y-5">
      <TimeTopBar />

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header (matches screenshot layout) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-800">Edit Timesheet</h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-medium">Timesheet Period</span>
            <span className="text-slate-700 font-semibold">{periodLabel}</span>

            {/* Arrows (UI only as in screenshot) */}
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
            >
              <FiChevronLeft className="text-slate-500" />
            </button>
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
            >
              <FiChevronRight className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="px-3 py-3 text-left font-medium w-[240px]">Project</th>
                  <th className="px-3 py-3 text-left font-medium w-[200px]">Activity</th>

                  {dayCols.map((d) => (
                    <th key={d.key} className="px-2 py-3 text-center font-medium min-w-[96px]">
                      <div className="text-slate-700">{d.label}</div>
                      <div className="text-[10px] uppercase tracking-wide">{d.day}</div>
                    </th>
                  ))}

                  <th className="w-12" />
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={dayCols.length + 3} className="px-3 py-8 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  rows.map((row) => (
                    <tr key={row.clientId} className="border-t border-slate-100">
                      {/* Project */}
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          placeholder="Type for hints..."
                          value={row.project}
                          onChange={(e) => handleChangeRow(row.clientId, "project", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                        />
                      </td>

                      {/* Activity */}
                      <td className="px-3 py-3">
                        <div className="relative">
                          <select
                            value={row.task}
                            onChange={(e) => handleChangeRow(row.clientId, "task", e.target.value)}
                            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                          >
                            <option value="">-- Select --</option>
                            <option value="Development">Development</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Support">Support</option>
                          </select>
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <FiChevronDown />
                          </span>
                        </div>
                      </td>

                      {/* Hours */}
                      {dayCols.map((_, dayIndex) => (
                        <td key={dayIndex} className="px-2 py-3">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={row.hours?.[dayIndex] ?? ""}
                            onChange={(e) => handleChangeHour(row.clientId, dayIndex, e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                          />
                        </td>
                      ))}

                      {/* Delete */}
                      <td className="px-2 py-3 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.clientId)}
                          className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400"
                          aria-label="Delete row"
                          title="Delete row"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Add Row (matches screenshot style) */}
          <button
            type="button"
            onClick={handleAddRow}
            className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-green-600"
          >
            <span className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <FiPlus />
            </span>
            <span>Add Row</span>
          </button>
        </div>

        {/* Footer buttons (right aligned like screenshot) */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-7 py-2 rounded-full border border-lime-400 text-xs font-semibold text-lime-600 bg-white hover:bg-lime-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-7 py-2 rounded-full border border-lime-400 text-xs font-semibold text-lime-600 bg-white hover:bg-lime-50"
          >
            Reset
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-7 py-2 rounded-full bg-lime-500 text-xs font-semibold text-white hover:bg-lime-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </section>
    </div>
  );
}
