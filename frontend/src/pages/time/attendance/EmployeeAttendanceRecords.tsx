import React, { ChangeEvent, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

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

const DEFAULT_BULK_API = "/api/time/attendance/bulk-import";

/**
 * OPTIONAL: If you have an endpoint that returns dept/designation by employeeId.
 * Expected response: [{ employeeId, dept, designation, name }]
 * If you don't have it, leave it—UI will show "—" and continue.
 */
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
  const m = line.match(
    /from\s+(\d{1,2})\/(\d{1,2})\/(\d{4})\s+to\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/i
  );
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
    /NAME\s*([0-9]+)\s+([0-9]+)\s+(.+?)(?:\s{2,}|Present:|Absent:|Hours_Worked:|Overtime:|$)/i
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
    for (let c = 1; c < Math.min(row.length, 45); c++) {
      if (isDayNumber(row[c])) count++;
    }
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
function statusDotClass(status?: string): string {
  const t = s(status).toUpperCase();
  if (t === "P" || t === "PRESENT") return "bg-emerald-500";
  if (t === "A" || t === "ABSENT") return "bg-rose-500";
  if (t === "WO" || t === "W/O" || t === "WEEKOFF") return "bg-indigo-500";
  if (t === "H" || t === "HOLIDAY") return "bg-amber-500";
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
  for (let c = 1; c < daysRow.length; c++) {
    if (isDayNumber(daysRow[c])) dayCols.push({ col: c, day: Number(s(daysRow[c])) });
  }
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
async function postBulk(apiUrl: string, payload: any) {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(apiUrl, {
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

/* ========================= Component ========================= */
type SortKey = "empId" | "name";
type SortDir = "asc" | "desc";

export default function EmployeeAttendanceRecords(): JSX.Element {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [apiUrl, setApiUrl] = useState(DEFAULT_BULK_API);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedResult | null>(null);

  const [metaMap, setMetaMap] = useState<Record<string, EmployeeMeta>>({});

  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [serverResp, setServerResp] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("empId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const dateColumns: string[] = useMemo(() => {
    if (!parsed?.records?.length) return [];
    const set = new Set<string>();
    parsed.records.forEach((r) => set.add(r.date));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [parsed]);

  const employeeRows: EmployeeRow[] = useMemo(() => {
    if (!parsed?.records?.length) return [];
    const map = new Map<string, EmployeeRow>();

    for (const r of parsed.records) {
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
      arr = arr.filter((e) => {
        return (
          e.empId.toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.dept.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q)
        );
      });
    }

    arr.sort((a, b) => {
      const A = sortKey === "empId" ? a.empId : a.name;
      const B = sortKey === "empId" ? b.empId : b.name;
      const cmp = A.localeCompare(B, undefined, { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [parsed, metaMap, search, sortKey, sortDir]);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setServerResp(null);
    setParsed(null);
    setMetaMap({});

    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);

    try {
      setParsing(true);
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const result = buildFromWorkbook(wb, f.name);
      setParsed(result);

      // Optional enrichment for dept/designation/name
      const ids = Array.from(
        new Set(
          result.records
            .map((r) => s(r.cardNo) || s(r.payrollNo))
            .filter(Boolean)
        )
      );

      if (ids.length) {
        fetchEmployeeMeta(ids)
          .then((list) => {
            const m: Record<string, EmployeeMeta> = {};
            list.forEach((x) => (m[x.employeeId] = x));
            setMetaMap(m);
          })
          .catch(() => {
            // ignore if no endpoint
          });
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
      const resp = await postBulk(apiUrl, payload);
      setServerResp(resp);
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Attendance Register</h1>
            <p className="mt-1 text-sm text-slate-600">
              Matrix view like your screenshot: IN/OUT stacked per day (date-wise).
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:bg-slate-950"
              type="button"
            >
              Choose Excel
            </button>
            <button
              onClick={onUpload}
              disabled={uploading || parsing || !parsed?.records?.length}
              className={[
                "rounded-lg px-4 py-2 text-sm font-semibold shadow-sm",
                uploading || parsing || !parsed?.records?.length
                  ? "cursor-not-allowed bg-slate-200 text-slate-600"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
              ].join(" ")}
              type="button"
            >
              {uploading ? "Uploading..." : "Upload to DB"}
            </button>
          </div>
        </div>

        <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onPick} className="hidden" />

        {/* Controls */}
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-sm font-semibold text-slate-900">Import Settings</div>
            <div className="mt-1 text-xs text-slate-500">{fileName ? `File: ${fileName}` : "No file selected"}</div>

            <label className="mt-3 block text-xs font-medium text-slate-700">Bulk API URL</label>
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
              placeholder="/api/time/attendance/bulk-import"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                Employees: {employeeRows.length}
              </span>
              <span className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                Dates: {dateColumns.length}
              </span>
              {parsed ? (
                <span className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                  Month: {parsed.monthYear.y}-{pad2(parsed.monthYear.m)}
                </span>
              ) : null}
            </div>

            {parsing && (
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                Parsing Excel…
              </div>
            )}
            {error && (
              <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}
            {serverResp && (
              <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-200">
                <div className="font-semibold">Upload complete</div>
                <pre className="mt-2 max-h-40 overflow-auto text-xs text-emerald-900">
{JSON.stringify(serverResp, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Filters</div>
                <div className="mt-1 text-xs text-slate-500">Search employees by id/name/department/designation.</div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full sm:w-72 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => toggleSort("empId")}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                >
                  Emp Id {sortKey === "empId" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                >
                  Name {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix table */}
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 z-20 bg-white">
                <tr>
                  <th className="sticky left-0 z-30 min-w-[90px] border-b border-slate-200 bg-white px-3 py-3 text-left text-xs font-semibold text-slate-700">
                    Emp Id
                  </th>
                  <th className="sticky left-[90px] z-30 min-w-[220px] border-b border-slate-200 bg-white px-3 py-3 text-left text-xs font-semibold text-slate-700">
                    Name
                  </th>
                  <th className="sticky left-[310px] z-30 min-w-[160px] border-b border-slate-200 bg-white px-3 py-3 text-left text-xs font-semibold text-slate-700">
                    Dept.
                  </th>
                  <th className="sticky left-[470px] z-30 min-w-[160px] border-b border-slate-200 bg-white px-3 py-3 text-left text-xs font-semibold text-slate-700">
                    Designation
                  </th>

                  {dateColumns.map((d) => (
                    <th
                      key={d}
                      className="min-w-[140px] border-b border-slate-200 px-3 py-2 text-center text-[11px] font-semibold text-slate-700"
                    >
                      <div className="leading-4">{formatHeaderDate(d)}</div>
                      <div className="text-[10px] font-medium text-slate-500">{weekdayLabel(d)}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {!parsed?.records?.length ? (
                  <tr>
                    <td colSpan={4 + Math.max(1, dateColumns.length)} className="px-6 py-12 text-center text-slate-500">
                      Choose an Excel file to generate the matrix table.
                    </td>
                  </tr>
                ) : employeeRows.length === 0 ? (
                  <tr>
                    <td colSpan={4 + dateColumns.length} className="px-6 py-12 text-center text-slate-500">
                      No employees match your search.
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
                              <div className="text-slate-400">=</div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${dot}`} />
                                <div className="flex flex-col items-center leading-5">
                                  <span className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2">
                                    {s(cell?.inTime) || "—"}
                                  </span>
                                  <span className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2">
                                    {s(cell?.outTime) || "—"}
                                  </span>
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

          {parsed?.records?.length ? (
            <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
              Dept/Designation shows “—” unless you connect <span className="font-semibold">{EMPLOYEE_META_API}</span>.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
