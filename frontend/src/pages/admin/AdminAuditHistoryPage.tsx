import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Search, X } from "lucide-react";
import {
  useGetAuditHistoryQuery,
  type AuditLog,
} from "../../features/audit/auditApi";

const inputCls =
  "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-300";
const selectCls =
  "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-300";
const btnCls =
  "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white hover:bg-slate-50 border border-slate-200";

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
  // firstName -> First Name, employeeId -> Employee Id
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

    // ignore noisy mongoose fields
    if (k === "__v") return;

    // stringify compare for shallow diff
    const same = JSON.stringify(bv) === JSON.stringify(av);
    if (!same) {
      rows.push({ key: k, label: labelize(k), before: bv, after: av });
    }
  });

  // stable sort: important fields first
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
    "px-2.5 py-1 rounded-full text-xs border inline-flex items-center font-semibold";
  const map: Record<string, string> = {
    CHANGE_REQUEST_CREATED: "bg-yellow-50 border-yellow-200 text-yellow-700",
    CHANGE_REQUEST_APPROVED: "bg-green-50 border-green-200 text-green-700",
    CHANGE_REQUEST_REJECTED: "bg-red-50 border-red-200 text-red-700",
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

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className="text-[12px] text-slate-700 font-medium">{value}</span>
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

  const requestedBy =
    (log.meta as any)?.requestedByUsername ||
    (log.meta as any)?.requestedByName ||
    (log.meta as any)?.requestedBy ||
    "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        // click outside to close
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className="w-full max-w-6xl rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-sm md:text-base font-semibold text-slate-900">
                  {headerTitle}
                </div>
                <ActionPill action={log.action} />
                <div className="text-xs text-slate-500">{subTitle}</div>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
                <MetaChip label="Actor" value={actor} />
                <MetaChip label="Approved By" value={approvedBy} />
                <MetaChip
                  label="Approved At"
                  value={fmtDateTime(log.approvedAt)}
                />
                <MetaChip
                  label="Reason"
                  value={(log.decisionReason || "").trim() || "—"}
                />
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Summary line */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Changed fields:</span>
            <span className="font-semibold text-slate-900">
              {rows.length || 0}
            </span>
            {log.ip ? (
              <span className="ml-3 text-xs text-slate-400">IP: {log.ip}</span>
            ) : null}
          </div>

          {/* Diff table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
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
              <div className="px-4 py-8 text-sm text-slate-500">
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
                    <div className="col-span-4 px-4 py-3 text-slate-700 font-medium">
                      {r.label}
                      <div className="text-[11px] text-slate-400">{r.key}</div>
                    </div>

                    <div className="col-span-4 px-4 py-3 border-l border-slate-200 text-slate-700">
                      <span className="inline-flex items-center rounded-lg bg-red-50 text-red-700 border border-red-100 px-2 py-1 text-xs font-medium">
                        {normalizeValue(r.before)}
                      </span>
                    </div>

                    <div className="col-span-4 px-4 py-3 border-l border-slate-200 text-slate-700">
                      <span className="inline-flex items-center rounded-lg bg-green-50 text-green-700 border border-green-100 px-2 py-1 text-xs font-medium">
                        {normalizeValue(r.after)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional: show appliedResult metadata without JSON */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] font-semibold text-slate-500 mb-1">
                Change Request
              </div>
              <div className="text-sm text-slate-800 font-medium">
                {shortId(log.changeRequestId)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] font-semibold text-slate-500 mb-1">
                Target ID
              </div>
              <div className="text-sm text-slate-800 font-medium">
                {shortId(log.targetId)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] font-semibold text-slate-500 mb-1">
                Action Type
              </div>
              <div className="text-sm text-slate-800 font-medium">
                {log.actionType}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
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

  const actionTypeOptions = useMemo(
    () => ["", "CREATE", "UPDATE", "DELETE"],
    []
  );

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white"
      >
        <div className="px-4 md:px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="text-lg font-semibold text-slate-900">
            Admin History
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              className={btnCls}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="px-4 md:px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <div className="text-xs text-slate-500 mb-1">Module</div>
            <input
              className={inputCls}
              value={module}
              onChange={(e) => setModule(e.target.value)}
              placeholder="PIM / Leave / Admin..."
            />
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1">Model</div>
            <input
              className={inputCls}
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Employee / JobTitle..."
            />
          </div>

          <div>
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

          <div>
            <div className="text-xs text-slate-500 mb-1">Search</div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputCls} pl-9`}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="targetId / reason / module..."
                />
              </div>
              <button
                className={btnCls}
                onClick={() => {
                  setModule("");
                  setModelName("");
                  setActionType("");
                  setQ("");
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 pb-6">
          <div className="overflow-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-3 py-2">Time</th>
                  <th className="text-left px-3 py-2">Module</th>
                  <th className="text-left px-3 py-2">Model</th>
                  <th className="text-left px-3 py-2">Action</th>
                  <th className="text-left px-3 py-2">Type</th>
                  <th className="text-left px-3 py-2">Actor Role</th>
                  <th className="text-left px-3 py-2">Target</th>
                  <th className="text-right px-3 py-2">View</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={8}>
                      Loading history...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="px-3 py-4 text-red-600" colSpan={8}>
                      Failed to load audit history. Check API + auth.
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={8}>
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-600">
                        {fmtDateTime(l.createdAt)}
                      </td>
                      <td className="px-3 py-2 text-slate-800">{l.module}</td>
                      <td className="px-3 py-2 text-slate-800">
                        {l.modelName}
                      </td>
                      <td className="px-3 py-2">
                        <ActionPill action={l.action} />
                      </td>
                      <td className="px-3 py-2 text-slate-800">
                        {l.actionType}
                      </td>
                      <td className="px-3 py-2 text-slate-800">
                        {l.actorRole}
                      </td>
                      <td className="px-3 py-2 text-slate-500 font-mono">
                        {shortId(l.targetId)}
                      </td>
                      <td className="px-3 py-2 text-right">
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

          {isFetching && !isLoading && (
            <div className="mt-3 text-xs text-slate-500">Refreshing…</div>
          )}
        </div>
      </motion.div>

      <Modal open={!!view} onClose={() => setView(null)} log={view} />
    </div>
  );
}
