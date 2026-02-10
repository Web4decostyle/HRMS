import React, { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { useGetMyAttendanceRecordsByDateQuery } from "../../features/time/attendanceApi";

import TimeTopBar from "./TimeTopBar";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toInputDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  // Example: "2026-01-06 01:57 PM"
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());

  let h = d.getHours();
  const m = pad2(d.getMinutes());
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;

  return `${yyyy}-${mm}-${dd} ${pad2(h)}:${m} ${ampm}`;
}

function tzLabelFromLocal() {
  // "GMT +05:30"
  const off = -new Date().getTimezoneOffset(); // minutes east
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  const hh = pad2(Math.floor(abs / 60));
  const mm = pad2(abs % 60);
  return `GMT ${sign}${hh}:${mm}`;
}

export default function MyAttendanceRecordsPage() {
  const today = useMemo(() => new Date(), []);
  const [date, setDate] = useState<string>(toInputDate(today));
  const [submittedDate, setSubmittedDate] = useState<string>(toInputDate(today));

  const { data, isFetching, error } = useGetMyAttendanceRecordsByDateQuery(
    submittedDate
  );

  const onView = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedDate(date);
  };

  const totalHours = data?.totalDurationHours ?? 0;
  const count = data?.count ?? 0;
  const rows = data?.rows ?? [];

  const tz = rows[0]?.tzLabel || tzLabelFromLocal();

  return (
    <div className="space-y-6">
      <TimeTopBar />

      {/* main */}
      <div className="px-4 md:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Top card: My Attendance Records */}
          <div className="bg-white rounded-[22px] shadow-sm border border-slate-100 px-6 md:px-10 py-7">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-slate-700">
                My Attendance Records
              </h2>

              {/* collapse icon placeholder */}
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <span className="text-[12px]">▲</span>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100" />

            <form onSubmit={onView} className="mt-6">
              <label className="block text-sm font-medium text-slate-700">
                Date<span className="text-green-500">*</span>
              </label>

              <div className="mt-2 flex items-end justify-between gap-6 flex-wrap">
                <div className="relative w-[240px]">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="
                      w-full h-11 rounded-xl border border-slate-200 bg-white
                      px-4 pr-12 text-sm text-slate-700 outline-none
                      focus:ring-2 focus:ring-green-200 focus:border-green-300
                    "
                    required
                    disabled={isFetching}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-100">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isFetching}
                  className="
                    h-10 px-10 rounded-full bg-lime-600 text-white text-sm font-semibold
                    hover:bg-lime-700 active:scale-[0.99] transition disabled:opacity-60
                  "
                >
                  {isFetching ? "Loading..." : "View"}
                </button>
              </div>

              <div className="mt-6 border-t border-slate-100" />

              <div className="mt-4 text-xs text-slate-500">
                <span className="text-slate-500">*</span> Required
              </div>
            </form>
          </div>

          {/* Records table card */}
          <div className="mt-6 bg-white rounded-[22px] shadow-sm border border-slate-100 px-0 py-0 overflow-hidden">
            <div className="px-6 md:px-10 py-5 flex items-center justify-end">
              <div className="text-sm text-slate-500">
                Total Duration (Hours):{" "}
                <span className="text-slate-700 font-medium">
                  {totalHours.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            <div className="px-6 md:px-10 py-4 text-sm text-slate-500">
              ({count}) Record Found
            </div>

            <div className="border-t border-slate-100" />

            {/* Header row */}
            <div className="bg-slate-100/80 px-6 md:px-10 py-3 text-[12px] font-semibold text-slate-600 grid grid-cols-5 gap-4">
              <div>Punch In</div>
              <div>Punch In Note</div>
              <div>Punch Out</div>
              <div>Punch Out Note</div>
              <div className="text-right">Duration (Hours)</div>
            </div>

            {/* Data rows */}
            <div className="px-4 md:px-6 py-4">
              {error ? (
                <div className="text-sm text-green-600 px-2 py-4">
                  Failed to load records for this date.
                </div>
              ) : rows.length === 0 ? (
                <div className="text-sm text-slate-500 px-2 py-6">
                  No records found.
                </div>
              ) : (
                rows.map((r, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-[16px] border border-slate-100 shadow-[0_1px_0_rgba(0,0,0,0.02)] px-6 md:px-10 py-4 mb-3 grid grid-cols-5 gap-4 text-[12px] text-slate-600"
                  >
                    <div>
                      <div className="text-slate-700">{fmtDateTime(r.punchInAt)}</div>
                      <div className="text-slate-400">{r.tzLabel || tz}</div>
                    </div>

                    <div className="text-slate-500">{r.punchInNote || "—"}</div>

                    <div>
                      <div className="text-slate-700">{fmtDateTime(r.punchOutAt)}</div>
                      <div className="text-slate-400">{r.punchOutAt ? (r.tzLabel || tz) : ""}</div>
                    </div>

                    <div className="text-slate-500">{r.punchOutNote || "—"}</div>

                    <div className="text-right text-slate-700 font-medium">
                      {Number(r.durationHours || 0).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="h-10" />
          </div>

          {/* Footer */}
          <div className="py-10 text-center text-xs text-slate-400">
            DecoStyle OS 5.7 · © 2005 - {new Date().getFullYear()} Decostyle, Inc.
          </div>
        </div>
      </div>
    </div>
  );
}
