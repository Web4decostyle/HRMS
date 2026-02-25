// frontend/src/pages/time/attendance/EmployeeAttendanceRecords.tsx
import React, { ChangeEvent, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import TimeTopTabs from "../TimeTopBar";

/* ========================= Types ========================= */
type MonthYear = { y: number; m: number };

type AttendanceRecord = {
  payrollNo?: string;
  cardNo?: string;
  employeeName?: string;
  date: string; // YYYY-MM-DD
  inTime?: string;
  outTime?: string;
  status?: string;
};

type ParsedResult = {
  monthYear: MonthYear;
  employees: { key: string; payrollNo?: string; cardNo?: string; name?: string }[];
  records: AttendanceRecord[];
};

type EmployeeMeta = {
  employeeId: string;
  dept?: string;
  designation?: string;
  name?: string;
};

type EmployeeRow = {
  empId: string; // cardNo/payrollNo
  name: string;
  dept: string;
  designation: string;
  byDate: Record<string, { inTime?: string; outTime?: string; status?: string }>;
};

type DbRegisterRow = {
  _id: string;
  employeeId: string;
  payrollNo?: string;
  cardNo?: string;
  employeeName?: string;
  date: string; // YYYY-MM-DD
  inTime?: string;
  outTime?: string;
  status?: string;
  month: string; // YYYY-MM
};

const DEFAULT_BULK_API = "/api/time/attendance/bulk-import";
const DEFAULT_DB_GET_API = "/api/time/attendance/register";
const EMPLOYEE_META_API = "/api/employees/meta-by-ids";

/* ========================= Helpers ========================= */
function s(v: unknown) {
  return String(v ?? "").replace(/\u00A0/g, " ").trim();
}
function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function isoDate(y: number, m: number, d: number) {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}
function normalizeKey(x: unknown) {
  return s(x).toLowerCase().replace(/\s+/g, "").replace(/_/g, "").replace(/-/g, "");
}
function isDayNumber(v: unknown) {
  const t = s(v);
  if (!/^\d{1,2}$/.test(t)) return false;
  const n = Number(t);
  return n >= 1 && n <= 31;
}
function parseMonthYearFromFilename(name: string): MonthYear | null {
  const m = name.match(/(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})/);
  if (!m) return null;
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (!month || !year) return null;
  return { y: year, m: month };
}
function parseMonthYearFromHeader(matrix: any[][]): MonthYear | null {
  const flat = matrix.flat().map((x) => s(x)).filter(Boolean);
  const line = flat.find((t) => /monthly performance register/i.test(t));
  if (!line) return null;
  const m = line.match(/from\s+(\d{1,2})\/(\d{1,2})\/(\d{4})\s+to\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
  if (!m) return null;
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (!month || !year) return null;
  return { y: year, m: month };
}
function cleanEmployeeName(raw: string): string {
  return s(raw)
    .replace(/\s+Present:.*$/i, "")
    .replace(/\s+Absent:.*$/i, "")
    .replace(/\s+Hours[_\s]*Worked:.*$/i, "")
    .replace(/\s+Hours_Worked:.*$/i, "")
    .replace(/\s+Overtime:.*$/i, "")
    .trim();
}
function parsePayrollHeader(header: string): { payrollNo?: string; cardNo?: string; name?: string } {
  const t = s(header);
  const m = t.match(
    /NAME\s*([0-9]+)\s+([0-9]+)\s+(.+?)(?:\s{2,}|Present:|Absent:|Hours_Worked:|Overtime:|$)/i,
  );
  if (m) return { payrollNo: s(m[1]), cardNo: s(m[2]), name: cleanEmployeeName(m[3]) };

  const nums = t.match(/\d+/g) || [];
  const payrollNo = nums[0] ? s(nums[0]) : "";
  const cardNo = nums[1] ? s(nums[1]) : "";
  let name = "";
  if (cardNo) {
    const idx = t.indexOf(cardNo);
    if (idx >= 0) name = cleanEmployeeName(t.slice(idx + cardNo.length));
  }
  return { payrollNo, cardNo, name: cleanEmployeeName(name) };
}
function findDaysHeaderRow(matrix: any[][]): number {
  for (let r = 0; r < Math.min(matrix.length, 250); r++) {
    const row = matrix[r] || [];
    let count = 0;
    for (let c = 1; c < Math.min(row.length, 45); c++) if (isDayNumber(row[c])) count++;
    if (count >= 10) return r;
  }
  return -1;
}
function mapLabelRows(block: any[][]) {
  const out: Record<string, any[] | undefined> = {};
  for (const row of block) {
    const key = normalizeKey(row?.[0]);
    if (!key) continue;
    if (key === "in1") out.in1 = row;
    else if (key === "out1") out.out1 = row;
    else if (key === "in2") out.in2 = row;
    else if (key === "out2") out.out2 = row;
    else if (key === "status") out.status = row;
  }
  return out as { in1?: any[]; out1?: any[]; in2?: any[]; out2?: any[]; status?: any[] };
}
function pickOutTime(out1?: unknown, out2?: unknown) {
  const a = s(out1);
  const b = s(out2);
  return b || a || "";
}
function weekdayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()];
}
function formatHeaderDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

type StatusFilter = "ALL" | "PRESENT" | "ABSENT" | "WEEKOFF" | "HOLIDAY" | "OTHER";
function normStatus(status?: string): StatusFilter {
  const t = s(status).toUpperCase();
  if (t === "P" || t === "PRESENT") return "PRESENT";
  if (t === "A" || t === "ABSENT") return "ABSENT";
  if (t === "WO" || t === "W/O" || t === "WEEKOFF" || t === "WEEK OFF") return "WEEKOFF";
  if (t === "H" || t === "HOLIDAY") return "HOLIDAY";
  if (!t) return "OTHER";
  return "OTHER";
}
function isPresentStatus(status?: string) {
  return normStatus(status) === "PRESENT";
}
function statusDotClass(status?: string): string {
  const t = normStatus(status);
  if (t === "PRESENT") return "bg-emerald-500";
  if (t === "ABSENT") return "bg-rose-500";
  if (t === "WEEKOFF") return "bg-indigo-500";
  if (t === "HOLIDAY") return "bg-amber-500";
  return "bg-slate-300";
}

/* ========================= Parse Excel ========================= */
function buildFromWorkbook(wb: XLSX.WorkBook, fileName: string): ParsedResult {
  const sheetName = wb.SheetNames?.[0];
  if (!sheetName) throw new Error("No sheets found in the Excel file.");
  const ws = wb.Sheets[sheetName];
  const matrix: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });

  const headerRowIndex = findDaysHeaderRow(matrix);
  if (headerRowIndex < 0) throw new Error("Could not detect the day header row (01,02,03...).");

  const my = parseMonthYearFromHeader(matrix) || parseMonthYearFromFilename(fileName);
  if (!my) throw new Error("Could not detect month/year from sheet header or filename.");

  const daysRow = matrix[headerRowIndex] || [];
  const dayCols: { col: number; day: number }[] = [];
  for (let c = 1; c < daysRow.length; c++) if (isDayNumber(daysRow[c])) dayCols.push({ col: c, day: Number(s(daysRow[c])) });
  if (!dayCols.length) throw new Error("No day columns detected.");

  const records: AttendanceRecord[] = [];
  const empMap = new Map<string, { key: string; payrollNo?: string; cardNo?: string; name?: string }>();

  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const a = s(matrix[r]?.[0]);
    if (!/^PAYROLL\s+NO\.\s+CARD\s+NO\.\s*&\s*NAME/i.test(a)) continue;

    const emp = parsePayrollHeader(a);
    const key = emp.cardNo || emp.payrollNo || emp.name || `row_${r}`;
    if (!empMap.has(key)) empMap.set(key, { key, payrollNo: emp.payrollNo, cardNo: emp.cardNo, name: emp.name });

    const block: any[][] = [];
    for (let k = 0; k <= 16; k++) if (matrix[r + k]) block.push(matrix[r + k]);
    const mapped = mapLabelRows(block);

    for (const { col, day } of dayCols) {
      const date = isoDate(my.y, my.m, day);

      const in1 = s(mapped.in1?.[col]);
      const out1 = s(mapped.out1?.[col]);
      const in2 = s(mapped.in2?.[col]);
      const out2 = s(mapped.out2?.[col]);
      const status = s(mapped.status?.[col]);

      const out = pickOutTime(out1, out2);
      const inT = in1 || in2;

      if (!inT && !out && !status) continue;

      records.push({
        payrollNo: emp.payrollNo,
        cardNo: emp.cardNo,
        employeeName: emp.name,
        date,
        inTime: inT || "",
        outTime: out || "",
        status: status || "",
      });
    }
  }

  if (!records.length) throw new Error("No attendance records found. Please verify the Excel format.");
  return { monthYear: my, employees: Array.from(empMap.values()), records };
}

/* ========================= Optional meta ========================= */
async function fetchEmployeeMeta(employeeIds: string[]): Promise<EmployeeMeta[]> {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(EMPLOYEE_META_API, {
    method: "POST",
    headers,
    body: JSON.stringify({ employeeIds }),
  });

  if (!res.ok) throw new Error("Meta endpoint not available");
  return res.json();
}

/* ========================= Upload ========================= */
async function postBulk(payload: any) {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(DEFAULT_BULK_API, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(data?.message || data?.error || `Upload failed (${res.status})`);
  return data;
}

/* ========================= DB fetch ========================= */
async function fetchRegisterMonth(month: string, q: string) {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const params = new URLSearchParams();
  params.set("month", month);
  if (q) params.set("q", q);

  const res = await fetch(`${DEFAULT_DB_GET_API}?${params.toString()}`, {
    method: "GET",
    headers,
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(data?.message || data?.error || `Fetch failed (${res.status})`);
  return data as DbRegisterRow[];
}

/* ========================= Component ========================= */
type SortKey = "empId" | "name";
type SortDir = "asc" | "desc";
type ViewMode = "excel" | "db";

function monthStrFromMonthYear(my: MonthYear) {
  return `${my.y}-${pad2(my.m)}`;
}

export default function EmployeeAttendanceRecords(): JSX.Element {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("excel");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedResult | null>(null);

  // DB
  const [dbMonth, setDbMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
  });
  const [dbRows, setDbRows] = useState<DbRegisterRow[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  const [metaMap, setMetaMap] = useState<Record<string, EmployeeMeta>>({});

  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [serverResp, setServerResp] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("empId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [presentOnly, setPresentOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const activeRecords: AttendanceRecord[] = useMemo(() => {
    if (viewMode === "excel") return parsed?.records || [];
    return (dbRows || []).map((r) => ({
      payrollNo: r.payrollNo,
      cardNo: r.cardNo || r.employeeId,
      employeeName: r.employeeName,
      date: r.date,
      inTime: r.inTime,
      outTime: r.outTime,
      status: r.status,
    }));
  }, [viewMode, parsed, dbRows]);

  const dateColumns: string[] = useMemo(() => {
    if (!activeRecords.length) return [];
    const set = new Set<string>();
    activeRecords.forEach((r) => set.add(r.date));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [activeRecords]);

  const summaryByDate: Record<string, { PRESENT: number; ABSENT: number; WEEKOFF: number; HOLIDAY: number; OTHER: number }> =
    useMemo(() => {
      const out: Record<string, any> = {};
      for (const d of dateColumns) out[d] = { PRESENT: 0, ABSENT: 0, WEEKOFF: 0, HOLIDAY: 0, OTHER: 0 };
      for (const r of activeRecords) {
        const d = r.date;
        if (!out[d]) continue;
        const st = normStatus(r.status);
        out[d][st] = (out[d][st] || 0) + 1;
      }
      return out;
    }, [activeRecords, dateColumns]);

  const employeeRows: EmployeeRow[] = useMemo(() => {
    if (!activeRecords.length) return [];
    const map = new Map<string, EmployeeRow>();

    for (const r of activeRecords) {
      const empId = s(r.cardNo) || s(r.payrollNo) || "";
      if (!empId) continue;

      if (!map.has(empId)) {
        const meta = metaMap[empId];
        map.set(empId, {
          empId,
          name: meta?.name || s(r.employeeName) || "—",
          dept: meta?.dept || "—",
          designation: meta?.designation || "—",
          byDate: {},
        });
      }

      const row = map.get(empId)!;
      if (row.name === "—" && s(r.employeeName)) row.name = s(r.employeeName);

      row.byDate[r.date] = {
        inTime: s(r.inTime) || "",
        outTime: s(r.outTime) || "",
        status: s(r.status) || "",
      };
    }

    let arr = Array.from(map.values());

    const q = s(search).toLowerCase();
    if (q) {
      arr = arr.filter((e) => e.empId.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q));
    }

    if (presentOnly) arr = arr.filter((emp) => dateColumns.some((d) => isPresentStatus(emp.byDate[d]?.status)));
    if (statusFilter !== "ALL") arr = arr.filter((emp) => dateColumns.some((d) => normStatus(emp.byDate[d]?.status) === statusFilter));

    arr.sort((a, b) => {
      const A = sortKey === "empId" ? a.empId : a.name;
      const B = sortKey === "empId" ? b.empId : b.name;
      const cmp = A.localeCompare(B, undefined, { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [activeRecords, metaMap, search, sortKey, sortDir, presentOnly, statusFilter, dateColumns]);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setServerResp(null);
    setParsed(null);
    setMetaMap({});
    setViewMode("excel");

    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);

    try {
      setParsing(true);
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const result = buildFromWorkbook(wb, f.name);
      setParsed(result);

      const ids = Array.from(new Set(result.records.map((r) => s(r.cardNo) || s(r.payrollNo)).filter(Boolean)));
      if (ids.length) {
        fetchEmployeeMeta(ids)
          .then((list) => {
            const m: Record<string, EmployeeMeta> = {};
            list.forEach((x) => (m[x.employeeId] = x));
            setMetaMap(m);
          })
          .catch(() => {});
      }
    } catch (err: any) {
      setError(err?.message || "Failed to parse Excel.");
    } finally {
      setParsing(false);
    }
  };

  const onUpload = async () => {
    setError("");
    setServerResp(null);
    if (!parsed?.records?.length) {
      setError("No records to upload.");
      return;
    }
    try {
      setUploading(true);
      const payload = {
        monthYear: parsed.monthYear,
        totalEmployees: parsed.employees.length,
        totalRecords: parsed.records.length,
        records: parsed.records,
      };
      const resp = await postBulk(payload);
      setServerResp(resp);
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const onLoadDb = async () => {
    setError("");
    setServerResp(null);
    setParsed(null);
    setFileName("");
    setViewMode("db");

    try {
      setDbLoading(true);
      const list = await fetchRegisterMonth(dbMonth, "");
      setDbRows(list);

      const ids = Array.from(new Set(list.map((r) => s(r.employeeId)).filter(Boolean)));
      if (ids.length) {
        fetchEmployeeMeta(ids)
          .then((metaList) => {
            const m: Record<string, EmployeeMeta> = {};
            metaList.forEach((x) => (m[x.employeeId] = x));
            setMetaMap(m);
          })
          .catch(() => {});
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load DB register.");
      setDbRows([]);
    } finally {
      setDbLoading(false);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  const monthLabel = viewMode === "excel" && parsed ? monthStrFromMonthYear(parsed.monthYear) : viewMode === "db" ? dbMonth : "";
  const totalEmployees = employeeRows.length;
  const totalDates = dateColumns.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <TimeTopTabs />

      <div className="mx-auto max-w-[1600px] px-4 py-6 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Attendance Register</h1>
              <p className="mt-1 text-sm text-slate-500">
                Admin view: Import Excel attendance and verify register from DB.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="h-10 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800"
                type="button"
              >
                Choose Excel
              </button>

              <button
                onClick={onUpload}
                disabled={uploading || parsing || !parsed?.records?.length}
                className={[
                  "h-10 rounded-full px-5 text-sm font-semibold",
                  uploading || parsing || !parsed?.records?.length
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-emerald-600 text-white hover:bg-emerald-700",
                ].join(" ")}
                type="button"
              >
                {uploading ? "Uploading..." : "Upload to DB"}
              </button>

              <div className="hidden md:block w-px bg-slate-200 mx-2" />

              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
              >
                <option value="excel">View: Excel</option>
                <option value="db">View: DB</option>
              </select>

              <input
                type="month"
                value={dbMonth}
                onChange={(e) => setDbMonth(e.target.value)}
                className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                title="Select month"
              />

              <button
                type="button"
                onClick={onLoadDb}
                disabled={dbLoading}
                className={[
                  "h-10 rounded-full px-5 text-sm font-semibold",
                  dbLoading ? "cursor-not-allowed bg-slate-200 text-slate-500" : "bg-blue-600 text-white hover:bg-blue-700",
                ].join(" ")}
              >
                {dbLoading ? "Loading..." : "Load DB"}
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="text-[11px] text-slate-500">Month</div>
              <div className="text-sm font-semibold text-slate-900">{monthLabel || "—"}</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="text-[11px] text-slate-500">Employees</div>
              <div className="text-sm font-semibold text-slate-900">{totalEmployees}</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="text-[11px] text-slate-500">Dates</div>
              <div className="text-sm font-semibold text-slate-900">{totalDates}</div>
            </div>
          </div>

          {fileName ? <div className="mt-3 text-xs text-slate-400">Selected file: {fileName}</div> : null}

          {(parsing || dbLoading) && (
            <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 border border-slate-100">
              {parsing ? "Parsing Excel…" : "Loading from DB…"}
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 border border-rose-100">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {serverResp && (
            <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 border border-emerald-100">
              <div className="font-semibold">Upload complete</div>
              <pre className="mt-2 max-h-40 overflow-auto text-xs text-emerald-900">{JSON.stringify(serverResp, null, 2)}</pre>
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onPick} className="hidden" />

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Filters</div>
              <div className="mt-1 text-xs text-slate-500">Search employees by empId / name / department / designation.</div>
            </div>

            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full md:w-72 h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
              />

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  className="h-4 w-4"
                  id="presentOnly"
                  type="checkbox"
                  checked={presentOnly}
                  onChange={(e) => setPresentOnly(e.target.checked)}
                />
                Present only
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
              >
                <option value="ALL">All</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="WEEKOFF">WeekOff</option>
                <option value="HOLIDAY">Holiday</option>
                <option value="OTHER">Other</option>
              </select>

              <button
                type="button"
                onClick={() => toggleSort("empId")}
                className="h-10 rounded-xl bg-white px-4 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
              >
                Emp Id {sortKey === "empId" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </button>

              <button
                type="button"
                onClick={() => toggleSort("name")}
                className="h-10 rounded-xl bg-white px-4 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
              >
                Name {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </button>
            </div>
          </div>
        </div>

        {/* Matrix table */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 z-20 bg-white">
                <tr>
                  <th className="sticky left-0 z-30 min-w-[90px] border-b border-slate-100 bg-white px-3 py-3 text-left text-xs font-semibold text-slate-700">
                    Emp Id
                  </th>
                  <th className="sticky left-[90px] z-30 min-w-[220px] border-b border-slate-100 bg-white px-3 py-3 text-left text-xs font-semibold text-slate-700">
                    Name
                  </th>
                  <th className="sticky left-[310px] z-30 min-w-[160px] border-b border-slate-100 bg-white px-3 py-3 text-left text-xs font-semibold text-slate-700">
                    Dept.
                  </th>
                  <th className="sticky left-[470px] z-30 min-w-[160px] border-b border-slate-100 bg-white px-3 py-3 text-left text-xs font-semibold text-slate-700">
                    Designation
                  </th>

                  {dateColumns.map((d) => (
                    <th key={d} className="min-w-[140px] border-b border-slate-100 px-3 py-2 text-center text-[11px] font-semibold text-slate-700">
                      <div className="leading-4">{formatHeaderDate(d)}</div>
                      <div className="text-[10px] font-medium text-slate-500">{weekdayLabel(d)}</div>
                    </th>
                  ))}
                </tr>

                {dateColumns.length > 0 ? (
                  <tr>
                    <th className="sticky left-0 z-30 border-b border-slate-100 bg-white px-3 py-2 text-left text-[11px] font-semibold text-slate-700">
                      Summary
                    </th>
                    <th className="sticky left-[90px] z-30 border-b border-slate-100 bg-white px-3 py-2 text-left text-[11px] font-semibold text-slate-700">
                      —
                    </th>
                    <th className="sticky left-[310px] z-30 border-b border-slate-100 bg-white px-3 py-2 text-left text-[11px] font-semibold text-slate-700">
                      —
                    </th>
                    <th className="sticky left-[470px] z-30 border-b border-slate-100 bg-white px-3 py-2 text-left text-[11px] font-semibold text-slate-700">
                      —
                    </th>

                    {dateColumns.map((d) => {
                      const sum = summaryByDate[d] || { PRESENT: 0, ABSENT: 0, WEEKOFF: 0, HOLIDAY: 0, OTHER: 0 };
                      return (
                        <th key={d} className="border-b border-slate-100 px-2 py-2 text-center text-[10px]">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <span className="rounded bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">P: {sum.PRESENT}</span>
                            <span className="rounded bg-rose-50 px-2 py-1 font-semibold text-rose-700">A: {sum.ABSENT}</span>
                            <span className="rounded bg-indigo-50 px-2 py-1 font-semibold text-indigo-700">WO: {sum.WEEKOFF}</span>
                            <span className="rounded bg-amber-50 px-2 py-1 font-semibold text-amber-700">H: {sum.HOLIDAY}</span>
                            {sum.OTHER ? <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">O: {sum.OTHER}</span> : null}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ) : null}
              </thead>

              <tbody>
                {!activeRecords.length ? (
                  <tr>
                    <td colSpan={4 + Math.max(1, dateColumns.length)} className="px-6 py-12 text-center text-slate-500">
                      {viewMode === "db" ? "Click “Load DB” to show saved data." : "Choose an Excel file to generate the matrix table."}
                    </td>
                  </tr>
                ) : employeeRows.length === 0 ? (
                  <tr>
                    <td colSpan={4 + dateColumns.length} className="px-6 py-12 text-center text-slate-500">
                      No employees match your filters.
                    </td>
                  </tr>
                ) : (
                  employeeRows.map((emp) => (
                    <tr key={emp.empId} className="hover:bg-slate-50">
                      <td className="sticky left-0 z-10 border-b border-slate-100 bg-white px-3 py-3 font-semibold text-slate-900">
                        {emp.empId}
                      </td>
                      <td className="sticky left-[90px] z-10 border-b border-slate-100 bg-white px-3 py-3 text-slate-900">
                        {emp.name}
                      </td>
                      <td className="sticky left-[310px] z-10 border-b border-slate-100 bg-white px-3 py-3 text-slate-700">
                        {emp.dept}
                      </td>
                      <td className="sticky left-[470px] z-10 border-b border-slate-100 bg-white px-3 py-3 text-slate-700">
                        {emp.designation}
                      </td>

                      {dateColumns.map((d) => {
                        const cell = emp.byDate[d];
                        const has = cell && (s(cell.inTime) || s(cell.outTime) || s(cell.status));
                        const dot = statusDotClass(cell?.status);

                        return (
                          <td key={d} className="border-b border-slate-100 px-3 py-2 text-center align-middle">
                            {!has ? (
                              <div className="text-slate-300 font-semibold">—</div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${dot}`} />
                                <div className="flex flex-col items-center leading-5">
                                  <span className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2">{s(cell?.inTime) || "—"}</span>
                                  <span className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2">{s(cell?.outTime) || "—"}</span>
                                  <span className="text-[10px] font-semibold text-slate-600">{s(cell?.status) || ""}</span>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {activeRecords.length ? (
            <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              Dept/Designation shows “—” unless you connect <span className="font-semibold">{EMPLOYEE_META_API}</span>.
            </div>
          ) : null}
        </div>

        <div className="py-6 text-center text-xs text-slate-400">DecoStyle · Attendance Register · © {new Date().getFullYear()}</div>
      </div>
    </div>
  );
}