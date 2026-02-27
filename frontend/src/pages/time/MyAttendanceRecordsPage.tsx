// frontend/src/pages/time/MyTimesheetViewPage.tsx
import { useEffect, useMemo, useState } from "react";
import TimeTopBar from "./TimeTopBar";
import { useGetMyAttendanceRecordsByDateQuery } from "../../features/time/attendanceApi";

/**
 * This page uses the Excel-imported Attendance Register from DB:
 * GET /api/time/attendance/me/register?month=YYYY-MM
 *
 * Color rules:
 * - Holiday/WeekOff override by status
 * - Otherwise based on (outTime - inTime):
 *   >= 8h30m => PRESENT
 *   >= 4h    => HALF_DAY
 *   else     => ABSENT
 */

/* ------------------------- helpers: calendar ------------------------- */

type DayKind =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "WEEK_OFF"
  | "HOLIDAY"
  | "FUTURE"
  | "EMPTY";

const FULL_SHIFT_HOURS = 8.5; // 8h 30m
const HALF_DAY_MIN_HOURS = 4;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function startOfMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0, 1);
}
function endOfMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0);
}
function isSameYMD(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function minutesToHM(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}
function hoursToHM(hours: number) {
  if (!Number.isFinite(hours) || hours <= 0) return "0h 0m";
  return minutesToHM(Math.round(hours * 60));
}

function fmtTimeHM(v?: string | null) {
  const s = String(v || "").trim();
  return s ? s : "-";
}

// supports "09:30" and "03:30 PM"
function parseAnyTimeToMinutes(t?: string | null) {
  const s = String(t || "").trim();
  if (!s) return null;

  // 09:30
  let m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) return hh * 60 + mm;
    return null;
  }

  // 03:30 PM
  m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m) {
    let hh = Number(m[1]);
    const mm = Number(m[2]);
    const ap = m[3].toUpperCase();
    if (hh < 1 || hh > 12 || mm < 0 || mm > 59) return null;
    if (ap === "PM" && hh !== 12) hh += 12;
    if (ap === "AM" && hh === 12) hh = 0;
    return hh * 60 + mm;
  }

  return null;
}

function computeDurationHours(inTime?: string | null, outTime?: string | null) {
  const inM = parseAnyTimeToMinutes(inTime);
  const outM = parseAnyTimeToMinutes(outTime);
  if (inM == null || outM == null) return 0;
  const diff = outM - inM;
  if (diff <= 0) return 0;
  return Math.round((diff / 60) * 100) / 100;
}

function kindBadge(kind: DayKind) {
  switch (kind) {
    case "PRESENT":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "ABSENT":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "HALF_DAY":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "WEEK_OFF":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "HOLIDAY":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "FUTURE":
      return "bg-slate-50 text-slate-400 border-slate-200";
    default:
      return "bg-white text-slate-600 border-slate-200";
  }
}

function kindToTile(kind: DayKind) {
  switch (kind) {
    case "PRESENT":
      return "bg-emerald-500 text-white shadow-emerald-500/20";
    case "ABSENT":
      return "bg-rose-600 text-white shadow-rose-500/20";
    case "HALF_DAY":
      return "bg-amber-200 text-slate-900 shadow-amber-500/10";
    case "WEEK_OFF":
      return "bg-slate-200 text-slate-900 shadow-slate-500/10";
    case "HOLIDAY":
      return "bg-indigo-400 text-white shadow-indigo-500/20";
    case "FUTURE":
      return "bg-slate-100 text-slate-400 shadow-none";
    case "EMPTY":
    default:
      return "bg-transparent text-slate-400 shadow-none";
  }
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------- register types + fetch ------------------------- */

type RegisterRow = {
  _id?: string;
  employeeId?: string;
  employeeName?: string;
  date: string; // YYYY-MM-DD
  inTime?: string;
  outTime?: string;
  status?: string; // P/A/WO/H etc.
  month?: string; // YYYY-MM
};

function authHeaders() {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    "";
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchMyRegisterMonth(month: string): Promise<RegisterRow[]> {
  const params = new URLSearchParams();
  params.set("month", month);

  const res = await fetch(
    `/api/time/attendance/me/register?${params.toString()}`,
    { method: "GET", headers: authHeaders() }
  );

  const text = await res.text();
  let data: any = [];
  try {
    data = JSON.parse(text);
  } catch {
    data = [];
  }

  if (!res.ok) throw new Error(data?.message || `Failed to load register (${res.status})`);
  return Array.isArray(data) ? data : [];
}

function normalizeStatus(s?: string | null) {
  const t = String(s || "").trim().toUpperCase();
  if (!t) return "";
  if (t === "P" || t === "PRESENT") return "P";
  if (t === "A" || t === "ABSENT") return "A";
  if (t === "WO" || t === "W/O" || t === "WEEKOFF" || t === "WEEK OFF") return "WO";
  if (t === "H" || t === "HOLIDAY") return "H";
  return t;
}

// ✅ MAIN FIX: PRESENT/HALF based on duration (8h30 threshold)
function kindFromRegister(d: Date, reg: RegisterRow | null, today: Date): DayKind {
  // future
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dayMs = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (dayMs > startOfToday) return "FUTURE";

  // Sunday off (keep if you want)
  if (d.getDay() === 0) return "WEEK_OFF";

  const st = normalizeStatus(reg?.status);

  // hard overrides
  if (st === "H") return "HOLIDAY";
  if (st === "WO") return "WEEK_OFF";

  const dur = computeDurationHours(reg?.inTime, reg?.outTime);

  // ✅ duration-based classification
  if (dur >= FULL_SHIFT_HOURS) return "PRESENT";
  if (dur >= HALF_DAY_MIN_HOURS) return "HALF_DAY";

  const hasIn = !!String(reg?.inTime || "").trim();
  const hasOut = !!String(reg?.outTime || "").trim();
  if (hasIn || hasOut) return "ABSENT";

  // no row or empty row => absent
  return "ABSENT";
}

/* ------------------------- component ------------------------- */

export default function MyTimesheetViewPage() {
  const today = useMemo(() => new Date(), []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const monthEnd = useMemo(() => endOfMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthStr = useMemo(() => `${viewYear}-${pad2(viewMonth + 1)}`, [viewYear, viewMonth]);

  // ✅ load register for month
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [registerRows, setRegisterRows] = useState<RegisterRow[]>([]);

  useEffect(() => {
    let alive = true;
    setRegLoading(true);
    setRegError(null);

    fetchMyRegisterMonth(monthStr)
      .then((list) => {
        if (!alive) return;
        setRegisterRows(list);
      })
      .catch((e: any) => {
        if (!alive) return;
        setRegisterRows([]);
        setRegError(e?.message || "Failed to load register.");
      })
      .finally(() => {
        if (!alive) return;
        setRegLoading(false);
      });

    return () => { alive = false; };
  }, [monthStr]);

  const regMap = useMemo(() => {
    const m = new Map<string, RegisterRow>();
    for (const r of registerRows) if (r?.date) m.set(r.date, r);
    return m;
  }, [registerRows]);

  const grid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startWeekday = first.getDay();
    const daysInMonth = monthEnd.getDate();

    const prevEnd = new Date(viewYear, viewMonth, 0);
    const prevDays = prevEnd.getDate();

    const cells: Array<{ date: Date }> = [];

    for (let i = 0; i < startWeekday; i++) {
      const dayNum = prevDays - (startWeekday - 1 - i);
      cells.push({ date: new Date(viewYear, viewMonth - 1, dayNum) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(viewYear, viewMonth, d) });
    }
    while (cells.length < 42) {
      const nextIndex = cells.length - (startWeekday + daysInMonth) + 1;
      cells.push({ date: new Date(viewYear, viewMonth + 1, nextIndex) });
    }
    return cells;
  }, [viewYear, viewMonth, monthEnd]);

  function goPrevMonth() {
    setSelectedDate(new Date(viewYear, viewMonth, 1));
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  }

  function goNextMonth() {
    setSelectedDate(new Date(viewYear, viewMonth, 1));
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  }

  function getKind(d: Date): DayKind {
    const inThisMonth = d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    if (!inThisMonth) return "EMPTY";
    const key = toYMD(d);
    const reg = regMap.get(key) || null;
    return kindFromRegister(d, reg, today);
  }

  const selectedKey = useMemo(() => toYMD(selectedDate), [selectedDate]);
  const selectedReg = useMemo(() => regMap.get(selectedKey) || null, [regMap, selectedKey]);
  const selectedKind = useMemo(() => getKind(selectedDate), [selectedDate, regMap, viewMonth, viewYear]);

  // still show manual punch sessions
  const { data: dayData, isLoading: dayLoading } = useGetMyAttendanceRecordsByDateQuery(selectedKey);

  // register-first day details
  const regIn = selectedReg?.inTime || "";
  const regOut = selectedReg?.outTime || "";
  const regStatus = normalizeStatus(selectedReg?.status);

  const regHours = useMemo(() => computeDurationHours(regIn, regOut), [regIn, regOut]);

  const firstIn = regIn ? fmtTimeHM(regIn) : "-";
  const lastOut = regOut ? fmtTimeHM(regOut) : "-";
  const totalHours = regHours > 0 ? hoursToHM(regHours) : "-";

  // month stats
  const stats = useMemo(() => {
    let present = 0, absent = 0, half = 0, off = 0, holiday = 0;
    for (let d = 1; d <= monthEnd.getDate(); d++) {
      const date = new Date(viewYear, viewMonth, d);
      const k = getKind(date);
      if (k === "PRESENT") present++;
      else if (k === "ABSENT") absent++;
      else if (k === "HALF_DAY") half++;
      else if (k === "WEEK_OFF") off++;
      else if (k === "HOLIDAY") holiday++;
    }
    return { present, absent, half, off, holiday };
  }, [viewYear, viewMonth, monthEnd, regMap, today]);

  return (
    <div className="space-y-6">
      <TimeTopBar />

      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Attendance Calendar (Register)
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-900">My Timesheet</h2>
            <p className="mt-1 text-sm text-slate-600">
              Uses Admin-imported register. Present is based on completing <b>8h 30m</b>.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:justify-end flex-wrap">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Today
            </button>
          </div>
        </div>

        {/* stats */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard label="Present" value={stats.present} className="from-emerald-50 to-white" />
          <StatCard label="Absent" value={stats.absent} className="from-rose-50 to-white" />
          <StatCard label="Half Day" value={stats.half} className="from-amber-50 to-white" />
          <StatCard label="Week Off" value={stats.off} className="from-slate-100 to-white" />
          <StatCard label="Holiday" value={stats.holiday} className="from-indigo-50 to-white" />
        </div>

        {regLoading ? (
          <div className="mt-3 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl p-3">
            Loading register for {monthStr}...
          </div>
        ) : regError ? (
          <div className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl p-3">
            {regError}
          </div>
        ) : null}
      </section>

      {/* layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={goPrevMonth}
              className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"
              aria-label="Previous month"
            >
              ‹
            </button>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <div className="text-base sm:text-lg font-semibold text-slate-900 text-center min-w-[160px]">
                {MONTHS[viewMonth]} {viewYear}
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                >
                  {MONTHS.map((m, idx) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </select>

                <input
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm w-24 bg-white"
                  type="number"
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value || today.getFullYear()))}
                />
              </div>
            </div>

            <button
              onClick={goNextMonth}
              className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3 mt-4 text-slate-500 text-[11px] sm:text-sm">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center font-medium">{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3 mt-2">
            {grid.map((cell, idx) => {
              const d = cell.date;
              const inThisMonth = d.getMonth() === viewMonth && d.getFullYear() === viewYear;
              const kind = getKind(d);
              const selected = isSameYMD(d, selectedDate);
              const key = toYMD(d);

              return (
                <button
                  key={idx}
                  type="button"
                  className={[
                    "group relative rounded-2xl flex items-center justify-center font-semibold select-none transition",
                    "h-11 text-sm sm:h-14 sm:text-base md:h-16 md:text-lg",
                    "shadow-sm",
                    kindToTile(kind),
                    selected ? "ring-2 ring-sky-400 ring-offset-2" : "hover:scale-[1.02] hover:shadow-md",
                    inThisMonth ? "" : "opacity-20 pointer-events-none",
                  ].join(" ")}
                  onClick={() => setSelectedDate(d)}
                  title={key}
                >
                  {d.getDate()}
                  {inThisMonth && regMap.has(key) && kind !== "FUTURE" ? (
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-white/90" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-700">
            <LegendDot color="bg-emerald-500" label="Present (≥ 8h30m)" />
            <LegendDot color="bg-amber-300" label="Half Day (≥ 4h)" />
            <LegendDot color="bg-rose-600" label="Absent" />
            <LegendDot color="bg-slate-400" label="Week Off" />
            <LegendDot color="bg-indigo-400" label="Holiday" />
          </div>
        </section>

        {/* Day details */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500">Selected Day</div>
              <div className="mt-1 text-base font-semibold text-slate-900">{selectedKey}</div>

              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold">
                <span
                  className={`h-2 w-2 rounded-full ${
                    selectedKind === "PRESENT"
                      ? "bg-emerald-500"
                      : selectedKind === "ABSENT"
                      ? "bg-rose-600"
                      : selectedKind === "HALF_DAY"
                      ? "bg-amber-400"
                      : selectedKind === "HOLIDAY"
                      ? "bg-indigo-500"
                      : selectedKind === "WEEK_OFF"
                      ? "bg-slate-500"
                      : "bg-slate-300"
                  }`}
                />
                <span className={`border rounded-full px-2 py-0.5 ${kindBadge(selectedKind)}`}>
                  {selectedKind.replaceAll("_", " ")}
                </span>
              </div>

              {selectedReg ? (
                <div className="mt-2 text-xs text-slate-600">
                  Register Status: <span className="font-semibold">{regStatus || "—"}</span>
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-500">No register row for this day.</div>
              )}
            </div>

            {dayLoading ? <div className="text-xs text-slate-400">Loading…</div> : null}
          </div>

          <div className="mt-4 space-y-3">
            <InfoCard label="First In (Register)" value={firstIn} />
            <InfoCard label="Last Out (Register)" value={lastOut} />
            <InfoCard label="Total Hours (Register)" value={totalHours} />
          </div>

          {/* Manual sessions */}
          <div className="mt-5">
            <div className="text-xs font-semibold text-slate-700 mb-2">Manual Punch Sessions (optional)</div>

            {dayData?.rows?.length ? (
              <div className="space-y-2">
                {dayData.rows.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 p-3 bg-gradient-to-br from-white to-slate-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {new Date(r.punchInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                        <span className="text-slate-400 font-normal">→</span>{" "}
                        {r.punchOutAt
                          ? new Date(r.punchOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "-"}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">
                        {hoursToHM(Number(r.durationHours || 0))}
                      </div>
                    </div>

                    {r.punchInNote || r.punchOutNote ? (
                      <div className="mt-2 text-xs text-slate-600">
                        {r.punchInNote ? <div>• {r.punchInNote}</div> : null}
                        {r.punchOutNote ? <div>• {r.punchOutNote}</div> : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                No manual punch sessions for this date.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------- small UI components ------------------------- */

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${
        className || "from-slate-50 to-white"
      } p-3`}
    >
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}