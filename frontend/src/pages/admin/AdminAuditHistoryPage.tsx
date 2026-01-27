import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Search,
  X,
  RefreshCw,
  Filter,
  ShieldCheck,
  Clock3,
  Hash,
  User2,
  CheckCircle2,
} from "lucide-react";
import {
  useGetAuditHistoryQuery,
  type AuditLog,
} from "../../features/audit/auditApi";

/* --------------------------------- styles -------------------------------- */

const card =
  "rounded-2xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]";
const softCard =
  "rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-[0_1px_0_rgba(15,23,42,0.04)]";

const inputCls =
  "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition";
const selectCls =
  "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition";
const btnCls =
  "inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm bg-white hover:bg-slate-50 border border-slate-200 shadow-sm active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-sm active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed";

function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(id?: string) {
  if (!id) return "—";
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

function labelize(key: string) {
  const spaced = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function isPlainObject(v: any) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function normalizeValue(v: any): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") {
    const s = v.trim();
    return s ? s : "—";
  }
  if (Array.isArray(v)) return v.length ? `${v.length} item(s)` : "—";
  if (isPlainObject(v)) return "Updated";
  return String(v);
}

type DiffRow = {
  key: string;
  label: string;
  before: any;
  after: any;
};

function diffFlat(before: any, after: any): DiffRow[] {
  const b = isPlainObject(before) ? before : {};
  const a = isPlainObject(after) ? after : {};
  const keys = new Set([...Object.keys(b), ...Object.keys(a)]);

  const rows: DiffRow[] = [];
  keys.forEach((k) => {
    const bv = b[k];
    const av = a[k];
    if (k === "__v") return;
    const same = JSON.stringify(bv) === JSON.stringify(av);
    if (!same) rows.push({ key: k, label: labelize(k), before: bv, after: av });
  });

  const priority = new Set([
    "firstName",
    "middleName",
    "lastName",
    "employeeId",
    "username",
    "email",
    "mobile",
    "status",
    "role",
  ]);

  rows.sort((r1, r2) => {
    const p1 = priority.has(r1.key) ? 0 : 1;
    const p2 = priority.has(r2.key) ? 0 : 1;
    if (p1 !== p2) return p1 - p2;
    return r1.label.localeCompare(r2.label);
  });

  return rows;
}

function ActionPill({ action }: { action: string }) {
  const base =
    "px-2.5 py-1 rounded-full text-[11px] border inline-flex items-center font-semibold tracking-wide";

  const map: Record<string, string> = {
    CHANGE_REQUEST_CREATED: "bg-amber-50 border-amber-200 text-amber-700",
    CHANGE_REQUEST_APPROVED: "bg-emerald-50 border-emerald-200 text-emerald-700",
    CHANGE_REQUEST_REJECTED: "bg-rose-50 border-rose-200 text-rose-700",

    LEAVE_REQUEST_CREATED: "bg-sky-50 border-sky-200 text-sky-700",
    LEAVE_REQUEST_APPROVED: "bg-emerald-50 border-emerald-200 text-emerald-700",
    LEAVE_REQUEST_REJECTED: "bg-rose-50 border-rose-200 text-rose-700",
    LEAVE_REQUEST_CANCELLED: "bg-slate-100 border-slate-200 text-slate-700",
    LEAVE_ASSIGNED: "bg-violet-50 border-violet-200 text-violet-700",
  };

  return (
    <span
      className={`${base} ${
        map[action] || "bg-white border-slate-200 text-slate-700"
      }`}
      title={action}
    >
      {action.replaceAll("_", " ")}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[12px] text-slate-600 shadow-sm">
      {children}
    </span>
  );
}

function MetaChip({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-[2px] text-slate-400">{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-400 leading-4">{label}</div>
        <div className="text-[13px] text-slate-800 font-medium truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

function Modal({
  open,
  onClose,
  log,
}: {
  open: boolean;
  onClose: () => void;
  log: AuditLog | null;
}) {
  if (!open || !log) return null;

  const rows = diffFlat(log.before, log.appliedResult ?? log.after);

  const headerTitle = `${log.module} / ${log.modelName}`;
  const subTitle = `${log.actionType} • Target: ${shortId(log.targetId)}`;

  const actor = log.actorUsername
    ? `${log.actorUsername} (${log.actorRole})`
    : `${log.actorRole} (${shortId(log.actorId)})`;

  const approvedBy = log.approvedByUsername
    ? log.approvedByUsername
    : log.approvedBy
    ? shortId(log.approvedBy)
    : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 190, damping: 18 }}
        className="w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-base md:text-lg font-semibold text-slate-900">
                  {headerTitle}
                </div>
                <ActionPill action={log.action} />
                <div className="text-xs text-slate-500">{subTitle}</div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <MetaChip
                    icon={<User2 className="w-4 h-4" />}
                    label="Actor"
                    value={actor}
                  />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <MetaChip
                    icon={<ShieldCheck className="w-4 h-4" />}
                    label="Approved By"
                    value={approvedBy}
                  />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <MetaChip
                    icon={<Clock3 className="w-4 h-4" />}
                    label="Approved At"
                    value={fmtDateTime(log.approvedAt)}
                  />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <MetaChip
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    label="Reason"
                    value={(log.decisionReason || "").trim() || "—"}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Changed fields:</span>
            <span className="font-semibold text-slate-900">{rows.length}</span>
            {log.ip ? (
              <Chip>
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-600">{log.ip}</span>
              </Chip>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50 text-[12px] font-semibold text-slate-600">
              <div className="col-span-4 px-4 py-3">Field</div>
              <div className="col-span-4 px-4 py-3 border-l border-slate-200">
                Before
              </div>
              <div className="col-span-4 px-4 py-3 border-l border-slate-200">
                After
              </div>
            </div>

            {rows.length === 0 ? (
              <div className="px-4 py-10 text-sm text-slate-500">
                No visible field-level changes (or the change was non-field
                based).
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-auto">
                {rows.map((r, idx) => (
                  <div
                    key={r.key}
                    className={`grid grid-cols-12 text-sm ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    <div className="col-span-4 px-4 py-3 text-slate-800 font-medium">
                      {r.label}
                      <div className="text-[11px] text-slate-400">{r.key}</div>
                    </div>

                    <div className="col-span-4 px-4 py-3 border-l border-slate-200">
                      <span className="inline-flex items-center rounded-xl bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1.5 text-xs font-medium">
                        {normalizeValue(r.before)}
                      </span>
                    </div>

                    <div className="col-span-4 px-4 py-3 border-l border-slate-200">
                      <span className="inline-flex items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1.5 text-xs font-medium">
                        {normalizeValue(r.after)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="text-[11px] font-semibold text-slate-500 mb-1">
                Change Request
              </div>
              <div className="text-sm text-slate-900 font-semibold">
                {shortId(log.changeRequestId)}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="text-[11px] font-semibold text-slate-500 mb-1">
                Target ID
              </div>
              <div className="text-sm text-slate-900 font-semibold">
                {shortId(log.targetId)}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="text-[11px] font-semibold text-slate-500 mb-1">
                Action Type
              </div>
              <div className="text-sm text-slate-900 font-semibold">
                {log.actionType}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-500">{title}</div>
          <div className="text-xl font-bold text-slate-900">{value}</div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminAuditHistoryPage() {
  const [module, setModule] = useState("");
  const [modelName, setModelName] = useState("");
  const [actionType, setActionType] = useState("");
  const [q, setQ] = useState("");
  const [view, setView] = useState<AuditLog | null>(null);

  const { data, isLoading, isFetching, error, refetch } =
    useGetAuditHistoryQuery(
      {
        module: module || undefined,
        modelName: modelName || undefined,
        actionType: actionType || undefined,
        q: q || undefined,
        limit: 500,
        page: 1,
      },
      { refetchOnFocus: true, refetchOnReconnect: true }
    );

  const logs = data?.items ?? [];

  const actionTypeOptions = useMemo(() => ["", "CREATE", "UPDATE", "DELETE"], []);

  const stats = useMemo(() => {
    const s = { total: logs.length, create: 0, update: 0, del: 0 };
    for (const l of logs) {
      if (l.actionType === "CREATE") s.create++;
      else if (l.actionType === "UPDATE") s.update++;
      else if (l.actionType === "DELETE") s.del++;
    }
    return s;
  }, [logs]);

  const hasFilters = !!(module || modelName || actionType || q);

  return (
    <div className="p-4 md:p-6">
      {/* Top hero */}
      <div className="mb-4">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 text-white p-5 md:p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold leading-tight">
                    Admin History
                  </div>
                  <div className="text-white/75 text-sm mt-0.5">
                    Track approvals, rejections, and changes across modules.
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Chip>
                  <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-700">
                    Showing up to <b>500</b> logs
                  </span>
                </Chip>
                {hasFilters ? (
                  <Chip>
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700">Filters active</span>
                  </Chip>
                ) : (
                  <Chip>
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700">No filters</span>
                  </Chip>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={primaryBtn}
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard title="Total" value={stats.total} icon={<Hash className="w-5 h-5" />} />
        <StatCard title="Create" value={stats.create} icon={<span className="text-xs font-bold">C</span>} />
        <StatCard title="Update" value={stats.update} icon={<span className="text-xs font-bold">U</span>} />
        <StatCard title="Delete" value={stats.del} icon={<span className="text-xs font-bold">D</span>} />
      </div>

      {/* Filters */}
      <div className={`${softCard} p-4 md:p-5 mb-4`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
            <Filter className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900">Filters</div>
            <div className="text-xs text-slate-500">
              Narrow down by module, model, action type, or keyword.
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              className={btnCls}
              onClick={() => {
                setModule("");
                setModelName("");
                setActionType("");
                setQ("");
              }}
              disabled={!hasFilters}
            >
              Clear
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3">
            <div className="text-xs text-slate-500 mb-1">Module</div>
            <input
              className={inputCls}
              value={module}
              onChange={(e) => setModule(e.target.value)}
              placeholder="PIM / Leave / Admin..."
            />
          </div>

          <div className="md:col-span-3">
            <div className="text-xs text-slate-500 mb-1">Model</div>
            <input
              className={inputCls}
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Employee / JobTitle..."
            />
          </div>

          <div className="md:col-span-2">
            <div className="text-xs text-slate-500 mb-1">Action Type</div>
            <select
              className={selectCls}
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
            >
              {actionTypeOptions.map((a) => (
                <option key={a} value={a}>
                  {a || "All"}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <div className="text-xs text-slate-500 mb-1">Search</div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className={`${inputCls} pl-10`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="targetId / reason / username / module..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className={card}
      >
        <div className="px-4 md:px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="font-semibold text-slate-900">Audit Logs</div>
          <div className="text-xs text-slate-500">
            {isLoading ? "Loading…" : `${logs.length} result(s)`}
          </div>

          {isFetching && !isLoading ? (
            <div className="ml-auto text-xs text-slate-500">Refreshing…</div>
          ) : (
            <div className="ml-auto" />
          )}
        </div>

        <div className="px-4 md:px-6 pb-6 pt-4">
          <div className="overflow-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Time</th>
                  <th className="text-left px-4 py-3 font-semibold">Module</th>
                  <th className="text-left px-4 py-3 font-semibold">Model</th>
                  <th className="text-left px-4 py-3 font-semibold">Action</th>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Actor Role</th>
                  <th className="text-left px-4 py-3 font-semibold">Target</th>
                  <th className="text-right px-4 py-3 font-semibold">View</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-10 text-slate-500" colSpan={8}>
                      Loading history...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="px-4 py-10 text-rose-600" colSpan={8}>
                      Failed to load audit history. Check API + auth.
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-slate-500" colSpan={8}>
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((l, idx) => (
                    <tr
                      key={l._id}
                      className={`hover:bg-slate-50 transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {fmtDateTime(l.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        {l.module}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{l.modelName}</td>
                      <td className="px-4 py-3">
                        <ActionPill action={l.action} />
                      </td>
                      <td className="px-4 py-3 text-slate-700">{l.actionType}</td>
                      <td className="px-4 py-3 text-slate-700">{l.actorRole}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {shortId(l.targetId)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className={btnCls} onClick={() => setView(l)}>
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <Modal open={!!view} onClose={() => setView(null)} log={view} />
    </div>
  );
}