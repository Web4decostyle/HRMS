import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  CircleDot,
  RefreshCw,
  Search,
  XCircle,
  FileDiff,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import {
  useApproveMutation,
  useGetPendingQuery,
  useRejectMutation,
} from "../../../features/changeRequests/changeRequestsApi";

type AnyObj = Record<string, any>;

const LABELS: Record<string, string> = {
  employeeId: "Employee ID",
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  nickname: "Nickname",
  otherId: "Other ID",
  driversLicense: "Driver’s License",
  licenseExpiry: "License Expiry",
  ssnNumber: "SSN Number",
  sinNumber: "SIN Number",
  nationality: "Nationality",
  maritalStatus: "Marital Status",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  smoker: "Smoker",
  militaryService: "Military Service",
};

function normalize(v: any) {
  if (typeof v === "string") return v.trim();
  return v;
}

function formatValue(v: any) {
  if (v === true) return "Yes";
  if (v === false) return "No";
  if (v === "" || v === null || v === undefined) return "—";
  return String(v);
}

function shallowDiff(before: AnyObj, after: AnyObj) {
  const b = before || {};
  const a = after || {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  const changed: Array<{ key: string; from: any; to: any }> = [];

  keys.forEach((k) => {
    if (
      k === "_id" ||
      k === "__v" ||
      k === "createdAt" ||
      k === "updatedAt" ||
      k === "password" ||
      k === "passwordHash"
    ) {
      return;
    }

    const fromVal = normalize(b[k]);
    const toVal = normalize(a[k]);

    const different = JSON.stringify(fromVal) !== JSON.stringify(toVal);
    if (!different) return;

    changed.push({ key: k, from: fromVal, to: toVal });
  });

  changed.sort((x, y) => {
    const ax = LABELS[x.key] ? 0 : 1;
    const ay = LABELS[y.key] ? 0 : 1;
    if (ax !== ay) return ax - ay;
    return x.key.localeCompare(y.key);
  });

  return changed;
}

function fmtWhen(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
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
  if (id.length <= 14) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

function Chip({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "green" | "red" | "amber" | "blue";
}) {
  const map: Record<string, string> = {
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${map[tone]}`}
    >
      {children}
    </span>
  );
}

function SoftButton({
  children,
  onClick,
  disabled,
  tone = "slate",
  className = "",
  title,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "slate" | "green" | "red";
  className?: string;
  title?: string;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition border";
  const map: Record<string, string> = {
    slate:
      "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100",
    green:
      "bg-green-600 border-green-600 text-white hover:bg-green-700 active:bg-green-800",
    red: "bg-green-600 border-green-600 text-white hover:bg-green-700 active:bg-green-800",
  };
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${map[tone]} disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export default function AdminApprovalsPage() {
  const { data: pending = [], refetch, isFetching, isLoading } =
    useGetPendingQuery();

  const [approve, { isLoading: approving }] = useApproveMutation();
  const [reject, { isLoading: rejecting }] = useRejectMutation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [search, setSearch] = useState("");

  const filteredPending = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pending || [];
    return (pending || []).filter((r: any) => {
      const hay = [
        r.modelName,
        r.action,
        r.module,
        r.requestedByRole,
        r.targetId,
        r.createdAt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [pending, search]);

  const selected = useMemo(() => {
    if (!filteredPending?.length) return null;
    return (
      filteredPending.find((x: any) => x._id === selectedId) ||
      filteredPending[0]
    );
  }, [filteredPending, selectedId]);

  const diffRows = useMemo(() => {
    if (!selected) return [];
    const after = (selected as any).after ?? (selected as any).payload ?? {};
    const before = (selected as any).before ?? {};
    return shallowDiff(before, after);
  }, [selected]);

  const employeeTitle = useMemo(() => {
    if (!selected) return "";
    const after = (selected as any).after ?? (selected as any).payload ?? {};
    const empId = after.employeeId || "";
    const name = [after.firstName, after.middleName, after.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return [empId ? `(${empId})` : "", name].filter(Boolean).join(" ");
  }, [selected]);

  async function onApprove() {
    if (!selected) return;
    await approve({ id: selected._id }).unwrap();
    setRejectReason("");
    refetch();
  }

  async function onReject() {
    if (!selected) return;
    await reject({ id: selected._id, decisionReason: rejectReason }).unwrap();
    setRejectReason("");
    refetch();
  }

  const busy = approving || rejecting;

  return (
    <div className="p-4 md:p-6">
      {/* Page topbar */}
      <div className="mb-4">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-xl md:text-2xl font-semibold text-slate-900">
                    Approvals
                  </div>
                  <Chip tone={filteredPending.length ? "amber" : "green"}>
                    <CircleDot className="w-4 h-4" />
                    Pending: {filteredPending.length}
                  </Chip>
                  {search.trim() && (
                    <Chip tone="slate">
                      <Search className="w-4 h-4" />
                      Filtered
                    </Chip>
                  )}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Review HR change requests and approve/reject them.
                </div>
              </div>

              <div className="md:ml-auto flex items-center gap-2">
                <div className="relative w-full md:w-[320px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search requests..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-slate-300"
                  />
                </div>

                <SoftButton
                  tone="slate"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                  {isFetching ? "Refreshing" : "Refresh"}
                </SoftButton>
              </div>
            </div>
          </div>

          {/* subtle helper row */}
          <div className="px-4 md:px-6 py-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2">
              <FileDiff className="w-4 h-4 text-slate-400" />
              Select a request on the left to review field-level changes.
            </span>
            <span className="mx-2 text-slate-300">•</span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              Approve applies changes; Reject keeps current data unchanged.
            </span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* LEFT: Pending list */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Pending requests
              </div>
              <div className="text-xs text-slate-500">
                {isLoading ? "Loading…" : `${filteredPending.length} item(s)`}
              </div>
            </div>

            <div className="max-h-[72vh] overflow-auto">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 p-3 animate-pulse"
                    >
                      <div className="h-4 w-2/3 bg-slate-200 rounded" />
                      <div className="h-3 w-1/2 bg-slate-200 rounded mt-2" />
                      <div className="h-3 w-1/3 bg-slate-200 rounded mt-2" />
                    </div>
                  ))}
                </div>
              ) : filteredPending.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-slate-900">
                    No pending approvals
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    You’re all caught up.
                  </div>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {filteredPending.map((r: any) => {
                    const isActive = selected?._id === r._id;
                    return (
                      <button
                        key={r._id}
                        onClick={() => setSelectedId(r._id)}
                        className={`w-full text-left rounded-2xl border p-3 transition ${
                          isActive
                            ? "border-green-200 bg-green-50/40"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {r.modelName} • {r.action}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Module: <span className="font-medium">{r.module}</span>{" "}
                              • By: <span className="font-medium">{r.requestedByRole}</span>
                            </div>
                          </div>

                          <div className="text-xs text-slate-500 whitespace-nowrap">
                            {fmtWhen(r.createdAt)}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <Chip tone="blue">
                            <UserRound className="w-4 h-4" />
                            Target: {shortId(r.targetId)}
                          </Chip>
                          {isActive ? (
                            <Chip tone="green">
                              <CircleDot className="w-4 h-4" />
                              Selected
                            </Chip>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Approval details */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {/* sticky-ish header */}
            <div className="px-4 md:px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    Review request
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Compare “Before” vs “After” and decide.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SoftButton
                    tone="green"
                    onClick={onApprove}
                    disabled={busy || !selected || diffRows.length === 0}
                    title="Approve"
                    className="min-w-[132px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {approving ? "Approving…" : "Approve"}
                  </SoftButton>

                  <SoftButton
                    tone="red"
                    onClick={onReject}
                    disabled={busy || !selected}
                    title="Reject"
                    className="min-w-[132px]"
                  >
                    <XCircle className="w-4 h-4" />
                    {rejecting ? "Rejecting…" : "Reject"}
                  </SoftButton>
                </div>
              </div>
            </div>

            {!selected ? (
              <div className="p-10 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <FileDiff className="w-6 h-6 text-slate-500" />
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-900">
                  Select a request
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Choose a pending item on the left to see its changes.
                </div>
              </div>
            ) : (
              <div className="p-4 md:p-6">
                {/* Summary tiles */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500">Model</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selected.modelName}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500">Action</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selected.action}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500">Target</div>
                    <div className="text-sm font-semibold text-slate-900 break-all">
                      {selected.targetId || "—"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500">Requested By</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selected.requestedByRole || "—"}
                    </div>
                  </div>
                </div>

                {/* Employee line */}
                {selected.modelName === "Employee" && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[11px] font-semibold text-slate-500">
                      Summary
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      HR wants to update Employee{" "}
                      <span className="font-extrabold">
                        {employeeTitle || selected.targetId}
                      </span>
                    </div>
                  </div>
                )}

                {/* Changes */}
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-sm font-semibold text-slate-900">
                      Changes requested
                    </div>
                    <Chip tone={diffRows.length ? "amber" : "green"}>
                      <FileDiff className="w-4 h-4" />
                      {diffRows.length} field(s)
                    </Chip>
                  </div>

                  {diffRows.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-600 bg-white">
                      No actual changes detected (payload matches current data).
                    </div>
                  ) : (
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

                      <div className="max-h-[44vh] overflow-auto">
                        {diffRows.map((row, idx) => (
                          <div
                            key={row.key}
                            className={`grid grid-cols-12 text-sm ${
                              idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                            }`}
                          >
                            <div className="col-span-4 px-4 py-3">
                              <div className="font-semibold text-slate-900">
                                {LABELS[row.key] || row.key}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {row.key}
                              </div>
                            </div>

                            <div className="col-span-4 px-4 py-3 border-l border-slate-200">
                              <span className="inline-flex items-center rounded-xl bg-green-50 text-green-700 border border-green-100 px-2 py-1 text-xs font-semibold">
                                {formatValue(row.from)}
                              </span>
                            </div>

                            <div className="col-span-4 px-4 py-3 border-l border-slate-200">
                              <span className="inline-flex items-center rounded-xl bg-green-50 text-green-700 border border-green-100 px-2 py-1 text-xs font-semibold">
                                {formatValue(row.to)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reject reason */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-slate-900 mb-2">
                    Reject reason <span className="text-xs text-slate-400">(optional)</span>
                  </div>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-slate-300"
                    placeholder="Write a reason if rejecting..."
                  />
                </div>

                <div className="text-xs text-slate-500">
                  Tip: If there are no field changes, Approve is disabled to prevent no-op approvals.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* subtle animation */}
      <motion.div
        className="mt-4 text-[11px] text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {isFetching ? "Syncing latest requests…" : ""}
      </motion.div>
    </div>
  );
}
