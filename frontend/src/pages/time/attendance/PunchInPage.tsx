// frontend/src/pages/time/attendance/PunchInPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import {
  useGetMyTodayAttendanceQuery,
  usePunchInMutation,
  usePunchOutMutation,
} from "../../../features/time/attendanceApi";

import TimeTopBar from "../TimeTopBar";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toInputDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// 12-hour format like "03:37 PM"
function toInputTime12h(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${pad2(h)}:${pad2(m)} ${ampm}`;
}

/**
 * Parses "hh:mm AM/PM" to { hours24, minutes }.
 * Returns null if invalid.
 */
function parseTime12h(input: string): { hours: number; minutes: number } | null {
  const s = input.trim().toUpperCase();
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/.exec(s);
  if (!m) return null;

  let hh = Number(m[1]);
  const mm = Number(m[2]);
  const ap = m[3];

  if (hh < 1 || hh > 12) return null;
  if (mm < 0 || mm > 59) return null;

  if (ap === "AM") {
    if (hh === 12) hh = 0;
  } else {
    if (hh !== 12) hh += 12;
  }

  return { hours: hh, minutes: mm };
}

export default function PunchInPage() {
  const now = useMemo(() => new Date(), []);
  const [date, setDate] = useState<string>(toInputDate(now));
  const [time, setTime] = useState<string>(toInputTime12h(now));
  const [note, setNote] = useState<string>("");

  const {
    data: today,
    isLoading: isLoadingToday,
    refetch,
    error: todayError,
  } = useGetMyTodayAttendanceQuery();

  const [punchIn, { isLoading: isPunchingIn }] = usePunchInMutation();
  const [punchOut, { isLoading: isPunchingOut }] = usePunchOutMutation();

  const isBusy = isLoadingToday || isPunchingIn || isPunchingOut;

  const isCurrentlyIn = today?.status === "IN";
  const title = isCurrentlyIn ? "Punch Out" : "Punch In";
  const buttonLabel = isCurrentlyIn ? "Out" : "In";

  // ✅ keep time fresh on first mount (optional)
  useEffect(() => {
    const t = setTimeout(() => {
      const d = new Date();
      setDate(toInputDate(d));
      setTime(toInputTime12h(d));
    }, 250);

    // ✅ cleanup must return a function, NOT JSX
    return () => clearTimeout(t);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isBusy) return;

    // Basic validation (date input is already ISO yyyy-mm-dd)
    const parsed = parseTime12h(time);
    if (!parsed) {
      alert("Please enter time in format: 03:37 PM");
      return;
    }

    // Create a datetime ISO string using local date + parsed time
    const [yyyy, mm, dd] = date.split("-").map(Number);
    const dt = new Date(yyyy, (mm || 1) - 1, dd || 1, parsed.hours, parsed.minutes, 0, 0);

    try {
      if (isCurrentlyIn) {
        await punchOut({
          time: dt.toISOString(),
          note: note?.trim() || undefined,
        } as any).unwrap();
      } else {
        await punchIn({
          time: dt.toISOString(),
          note: note?.trim() || undefined,
        } as any).unwrap();
      }

      await refetch();
      setNote("");
    } catch (err: any) {
      // show something helpful
      alert(err?.data?.message || "Failed to save. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <TimeTopBar />

      {/* Main content */}
      <div className="px-4 md:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-[22px] shadow-sm border border-slate-100 px-6 md:px-10 py-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-800">{title}</h2>

              {/* small status pill */}
              <div className="text-xs">
                <span
                  className={`px-3 py-1 rounded-full border ${
                    isCurrentlyIn
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  Status: {isLoadingToday ? "…" : today?.status || "OUT"}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100" />

            {!!todayError && (
              <div className="mt-4 text-sm text-green-600">
                Failed to load today status. Please login again or check API.
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6">
              {/* Date + Time row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Date<span className="text-green-500">*</span>
                  </label>

                  <div className="mt-2 relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="
                        w-full h-11 rounded-xl border border-slate-200 bg-[#f4f5ff]
                        px-4 pr-12 text-sm text-slate-700 outline-none
                        focus:ring-2 focus:ring-green-200 focus:border-green-300
                      "
                      required
                      disabled={isBusy}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-100">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Time<span className="text-green-500">*</span>
                  </label>

                  <div className="mt-2 relative">
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="hh:mm AM/PM"
                      className="
                        w-full h-11 rounded-xl border border-slate-200 bg-[#f4f5ff]
                        px-4 pr-12 text-sm text-slate-700 outline-none
                        focus:ring-2 focus:ring-green-200 focus:border-green-300
                      "
                      required
                      disabled={isBusy}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-100">
                      <Clock className="w-4 h-4 text-slate-500" />
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Format: <span className="font-medium">03:37 PM</span>
                  </p>
                </div>
              </div>

              {/* Note */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700">Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Type here"
                  className="
                    mt-2 w-full min-h-[120px] rounded-xl border border-slate-200
                    bg-white px-4 py-3 text-sm text-slate-700 outline-none resize-none
                    focus:ring-2 focus:ring-green-200 focus:border-green-300
                  "
                  disabled={isBusy}
                />
              </div>

              {/* Footer row */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  <span className="text-slate-500">*</span> Required
                </div>

                <button
                  type="submit"
                  disabled={isBusy}
                  className="
                    h-10 px-10 rounded-full bg-lime-600 text-white text-sm font-semibold
                    hover:bg-lime-700 active:scale-[0.99] transition disabled:opacity-60
                  "
                >
                  {isBusy ? "Saving..." : buttonLabel}
                </button>
              </div>
            </form>
          </div>

          <div className="py-10 text-center text-xs text-slate-400">
            DecoStyle OS 5.7 · © 2005 - {new Date().getFullYear()} Decostyle, Inc.
          </div>
        </div>
      </div>
    </div>
  );
}
