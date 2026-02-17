// frontend/src/pages/time/MyTimesheetViewPage.tsx
import { useMemo, useState } from "react";
import TimeTopBar from "./TimeTopBar";
import {
  useGetMyMonthSummaryQuery,
  useGetMyAttendanceRecordsByDateQuery,
  useImportMyAttendanceCsvMutation,
  CsvImportRow,
} from "../../features/time/attendanceApi";

import * as XLSX from "xlsx";

/* ------------------------- helpers: parsing ------------------------- */

function normalizeKey(s: any) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/-/g, "");
}

function excelTimeToHHMM(v: any): string {
  if (typeof v === "string") return v.trim();

  if (typeof v === "number" && v >= 0 && v < 1) {
    const totalMinutes = Math.round(v * 24 * 60);
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const hh = v.getHours();
    const mm = v.getMinutes();
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  return "";
}

function parseAnyDateToYMD(v: any): string {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const yyyy = v.getFullYear();
    const mm = String(v.getMonth() + 1).padStart(2, "0");
    const dd = String(v.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (d && d.y && d.m && d.d) {
      return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(
        2,
        "0",
      )}`;
    }
  }

  const s = String(v || "").trim();
  if (!s) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const m1 = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m1) {
    const dd = String(m1[1]).padStart(2, "0");
    const mm = String(m1[2]).padStart(2, "0");
    const yyyy = m1[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  const m2 = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (m2) {
    const yyyy = m2[1];
    const mm = String(m2[2]).padStart(2, "0");
    const dd = String(m2[3]).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return "";
}

/* ------------------------- helpers: calendar ------------------------- */

type DayKind = "PRESENT" | "ABSENT" | "HALF_DAY" | "WEEK_OFF" | "FUTURE" | "EMPTY";

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

function fmtTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function minutesToHM(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
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
    case "FUTURE":
      return "bg-slate-100 text-slate-400 shadow-none";
    case "EMPTY":
    default:
      return "bg-transparent text-slate-400 shadow-none";
  }
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------- parsing csv/xlsx ------------------------- */

function parseCsv(text: string): CsvImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const first = lines[0].toLowerCase();
  const hasHeader = first.includes("date") && first.includes("intime");
  const start = hasHeader ? 1 : 0;

  const out: CsvImportRow[] = [];

  for (let i = start; i < lines.length; i++) {
    const raw = lines[i];

    const parts: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let j = 0; j < raw.length; j++) {
      const ch = raw[j];
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === "," && !inQuotes) {
        parts.push(cur.trim().replace(/^"|"$/g, ""));
        cur = "";
      } else cur += ch;
    }
    parts.push(cur.trim().replace(/^"|"$/g, ""));

    const date = String(parts[0] || "").slice(0, 10);
    const inTime = String(parts[1] || "").trim();
    const outTime = String(parts[2] || "").trim();
    const note = String(parts[3] || "").trim();

    if (!date || !inTime) continue;

    out.push({
      date,
      inTime,
      outTime: outTime || undefined,
      note: note || undefined,
    });
  }

  return out;
}

async function parseXlsxFile(file: File): Promise<CsvImportRow[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });

  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];

  const ws = wb.Sheets[sheetName];
  const aoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

  if (!aoa.length) return [];

  const headerRow = aoa[0].map((h) => normalizeKey(h));

  const dateKeys = ["date", "day", "attendancedate", "punchdate"];
  const inKeys = [
    "intime",
    "in",
    "timein",
    "punchin",
    "punchinat",
    "checkin",
    "checkintime",
    "firstin",
  ];
  const outKeys = [
    "outtime",
    "out",
    "timeout",
    "punchout",
    "punchoutat",
    "checkout",
    "checkouttime",
    "lastout",
  ];
  const noteKeys = ["note", "remarks", "comment", "reason", "location"];

  const findIndex = (cands: string[]) => headerRow.findIndex((h) => cands.includes(h));

  let dateIdx = findIndex(dateKeys);
  let inIdx = findIndex(inKeys);
  let outIdx = findIndex(outKeys);
  let noteIdx = findIndex(noteKeys);

  const hasReadableHeader = dateIdx !== -1 || inIdx !== -1 || outIdx !== -1;
  if (!hasReadableHeader) {
    dateIdx = 0;
    inIdx = 1;
    outIdx = 2;
    noteIdx = 3;
  }

  const rows: CsvImportRow[] = [];

  for (let r = 1; r < aoa.length; r++) {
    const row = aoa[r];

    const date = parseAnyDateToYMD(row[dateIdx]);
    const inTime = excelTimeToHHMM(row[inIdx]);
    const outTime = excelTimeToHHMM(row[outIdx]);
    const note = String(row[noteIdx] || "").trim();

    if (!date || !inTime) continue;

    rows.push({
      date,
      inTime,
      outTime: outTime || undefined,
      note: note || undefined,
    });
  }

  return rows;
}

/* ------------------------- component ------------------------- */

export default function MyTimesheetViewPage() {
  const today = useMemo(() => new Date(), []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const monthStart = useMemo(() => startOfMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthEnd = useMemo(() => endOfMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  const from = useMemo(() => toYMD(monthStart), [monthStart]);
  const to = useMemo(() => toYMD(monthEnd), [monthEnd]);

  const { data: monthData, isLoading: monthLoading } = useGetMyMonthSummaryQuery({ from, to });

  const selectedKey = useMemo(() => toYMD(selectedDate), [selectedDate]);
  const { data: dayData, isLoading: dayLoading } = useGetMyAttendanceRecordsByDateQuery(selectedKey);

  const dayMap = useMemo(() => {
    const map = new Map<string, { totalMinutes: number; firstInAt: string | null; lastOutAt: string | null }>();
    for (const d of monthData?.days || []) map.set(d.date, d);
    return map;
  }, [monthData]);

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

    const dayKey = toYMD(d);

    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const dayMs = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (dayMs > startOfToday) return "FUTURE";

    // Sunday off
    if (d.getDay() === 0) return "WEEK_OFF";

    const rec = dayMap.get(dayKey);
    if (!rec) return "ABSENT";

    if (rec.totalMinutes > 0 && rec.totalMinutes < 240) return "HALF_DAY";
    return "PRESENT";
  }

  const selectedKind = useMemo(() => getKind(selectedDate), [selectedDate, dayMap, viewMonth, viewYear]);

  const stats = useMemo(() => {
    let present = 0,
      absent = 0,
      half = 0,
      off = 0;

    for (let d = 1; d <= monthEnd.getDate(); d++) {
      const date = new Date(viewYear, viewMonth, d);
      const k = getKind(date);
      if (k === "PRESENT") present++;
      else if (k === "ABSENT") absent++;
      else if (k === "HALF_DAY") half++;
      else if (k === "WEEK_OFF") off++;
    }

    return { present, absent, half, off };
  }, [viewYear, viewMonth, monthEnd, dayMap, today]);

  /* ------------------------- import modal ------------------------- */

  const [importOpen, setImportOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<CsvImportRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [importApi, { isLoading: importing }] = useImportMyAttendanceCsvMutation();

  async function onFilePicked(file: File) {
    setErr(null);
    setFileName(file.name);
    setRows([]);

    const lower = file.name.toLowerCase();

    try {
      let parsed: CsvImportRow[] = [];
      if (lower.endsWith(".csv")) {
        const text = await file.text();
        parsed = parseCsv(text);
      } else if (lower.endsWith(".xlsx")) {
        parsed = await parseXlsxFile(file);
      } else {
        setErr("Unsupported file type. Upload .csv or .xlsx");
        return;
      }

      if (!parsed.length) {
        setErr("No valid rows found. Sheet must contain Date + In Time.");
        return;
      }

      setRows(parsed);
    } catch (e: any) {
      setErr(e?.message || "Failed to read file.");
    }
  }

  async function submitImport() {
    setErr(null);
    if (!rows.length) {
      setErr("Upload a file first.");
      return;
    }

    const invalid = rows.find((r) => !/^\d{4}-\d{2}-\d{2}$/.test(r.date) || !r.inTime);
    if (invalid) {
      setErr("Invalid rows found. Ensure date is YYYY-MM-DD and inTime exists.");
      return;
    }

    try {
      await importApi({ rows }).unwrap();
      setImportOpen(false);
      setFileName("");
      setRows([]);
    } catch (e: any) {
      setErr(e?.data?.message || "Import failed");
    }
  }

  const dayTotalMinutes = dayData?.totalMinutes || 0;

  const firstIn = dayData?.rows?.[0]?.punchInAt ? fmtTime(dayData.rows[0].punchInAt) : "-";
  const lastOut = dayData?.rows?.length
    ? fmtTime(dayData.rows[dayData.rows.length - 1].punchOutAt || null)
    : "-";

  return (
    <div className="space-y-6">
      <TimeTopBar />

      {/* Hero Header */}
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Attendance Calendar
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-900">
              My Timesheet
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Track your daily punch in/out and monthly attendance at a glance.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:justify-end flex-wrap">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Today
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
            >
              Import CSV / XLSX
            </button>
          </div>
        </div>

        {/* mini stats */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Present" value={stats.present} className="from-emerald-50 to-white" />
          <StatCard label="Absent" value={stats.absent} className="from-rose-50 to-white" />
          <StatCard label="Half Day" value={stats.half} className="from-amber-50 to-white" />
          <StatCard label="Week Off" value={stats.off} className="from-slate-100 to-white" />
        </div>
      </section>

      {/* main layout: calendar + details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-3 sm:p-4">
          {/* month header */}
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
                    <option key={m} value={idx}>
                      {m}
                    </option>
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

          {/* weekday row */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 mt-4 text-slate-500 text-[11px] sm:text-sm">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center font-medium">
                {w}
              </div>
            ))}
          </div>

          {/* grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 mt-2">
            {grid.map((cell, idx) => {
              const d = cell.date;
              const inThisMonth = d.getMonth() === viewMonth && d.getFullYear() === viewYear;
              const kind = getKind(d);
              const selected = isSameYMD(d, selectedDate);

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
                  title={toYMD(d)}
                >
                  {d.getDate()}

                  {/* tiny dot indicator for data */}
                  {inThisMonth && dayMap.has(toYMD(d)) && kind !== "FUTURE" ? (
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-white/90" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* legend */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-700">
            <LegendDot color="bg-emerald-500" label="Present" />
            <LegendDot color="bg-rose-600" label="Absent" />
            <LegendDot color="bg-amber-300" label="Half Day" />
            <LegendDot color="bg-slate-400" label="Week Off" />
          </div>

          {monthLoading && (
            <div className="mt-3 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl p-3">
              Loading month data...
            </div>
          )}
        </section>

        {/* Day details */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500">Selected Day</div>
              <div className="mt-1 text-base font-semibold text-slate-900">{selectedKey}</div>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold">
                <span className={`h-2 w-2 rounded-full ${
                  selectedKind === "PRESENT" ? "bg-emerald-500" :
                  selectedKind === "ABSENT" ? "bg-rose-600" :
                  selectedKind === "HALF_DAY" ? "bg-amber-400" :
                  selectedKind === "WEEK_OFF" ? "bg-slate-500" :
                  "bg-slate-300"
                }`} />
                <span className={`border rounded-full px-2 py-0.5 ${kindBadge(selectedKind)}`}>
                  {selectedKind.replace("_", " ")}
                </span>
              </div>
            </div>

            {dayLoading ? (
              <div className="text-xs text-slate-400">Loading...</div>
            ) : null}
          </div>

          {/* cards */}
          <div className="mt-4 space-y-3">
            <InfoCard label="First Punch In" value={firstIn} />
            <InfoCard label="Last Punch Out" value={lastOut} />
            <InfoCard label="Total Hours" value={dayTotalMinutes ? minutesToHM(dayTotalMinutes) : "-"} />
          </div>

          {/* sessions list */}
          <div className="mt-5">
            <div className="text-xs font-semibold text-slate-700 mb-2">Sessions</div>

            {dayData?.rows?.length ? (
              <div className="space-y-2">
                {dayData.rows.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 p-3 bg-gradient-to-br from-white to-slate-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {fmtTime(r.punchInAt)}{" "}
                        <span className="text-slate-400 font-normal">→</span>{" "}
                        {fmtTime(r.punchOutAt || null)}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">
                        {minutesToHM(r.durationMinutes || 0)}
                      </div>
                    </div>

                    {(r.punchInNote || r.punchOutNote) ? (
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
                No punch record found for this date.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Import Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-black/40" onClick={() => setImportOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* top bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">Import Attendance</h3>
                  <p className="text-xs text-white/80 mt-1">
                    Upload <span className="font-mono">.csv</span> or{" "}
                    <span className="font-mono">.xlsx</span> with columns:{" "}
                    <span className="font-mono">date, inTime, outTime, note</span>
                  </p>
                </div>
                <button
                  onClick={() => setImportOpen(false)}
                  className="h-9 w-9 rounded-full border border-white/20 hover:bg-white/10"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              {/* file area */}
              <label className="block">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 hover:bg-slate-100 transition cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                      ⬆
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">
                        Choose a file
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        CSV or Excel (.xlsx). We will preview the first rows before import.
                      </div>
                      {fileName ? (
                        <div className="mt-2 inline-flex items-center gap-2 text-xs text-slate-700">
                          <span className="px-2 py-1 rounded-full bg-white border border-slate-200">
                            {fileName}
                          </span>
                          <span className="text-slate-500">
                            ({rows.length ? `${rows.length} rows detected` : "no rows"})
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <input
                    type="file"
                    accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onFilePicked(f);
                    }}
                  />
                </div>
              </label>

              {/* preview */}
              {rows.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="text-xs font-semibold text-slate-700">
                      Preview (first 6 rows)
                    </div>
                  </div>
                  <div className="p-3 overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="text-slate-500">
                        <tr>
                          <th className="text-left font-medium py-2 pr-4">Date</th>
                          <th className="text-left font-medium py-2 pr-4">In</th>
                          <th className="text-left font-medium py-2 pr-4">Out</th>
                          <th className="text-left font-medium py-2 pr-4">Note</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-800">
                        {rows.slice(0, 6).map((r, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="py-2 pr-4 font-mono">{r.date}</td>
                            <td className="py-2 pr-4 font-mono">{r.inTime}</td>
                            <td className="py-2 pr-4 font-mono">{r.outTime || "-"}</td>
                            <td className="py-2 pr-4">{r.note || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {err && (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl p-3">
                  {err}
                </div>
              )}

              {/* actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setImportOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold hover:bg-slate-50"
                  disabled={importing}
                >
                  Cancel
                </button>
                <button
                  onClick={submitImport}
                  className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60"
                  disabled={importing}
                >
                  {importing ? "Importing..." : "Import Now"}
                </button>
              </div>

              <div className="text-[11px] text-slate-500">
                Tip: In Time / Out Time can be <span className="font-mono">09:30</span> or{" "}
                <span className="font-mono">03:30 PM</span>.
              </div>
            </div>
          </div>
        </div>
      )}
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

function StatCard({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${className || "from-slate-50 to-white"} p-3`}>
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
