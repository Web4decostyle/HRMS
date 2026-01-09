import React, { useMemo, useState } from "react";
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

  // add more as needed (Contact, Job, Salary etc)
};

function isEmptyValue(v: any) {
  return v === undefined || v === null;
}

function normalize(v: any) {
  // trim strings
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
    // ignore noisy fields
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

    // if HR sends full form with blank fields, we still want a strict diff.
    // show only if actually different:
    const different = JSON.stringify(fromVal) !== JSON.stringify(toVal);

    // if "to" is missing and "from" exists, ignore (HR probably didn't intend to clear)
    // BUT if HR really wants to clear fields, you can remove this rule.
    if (!different) return;

    // If "to" is empty but "from" is not, treat as "clear request" (keep it visible)
    // If you DON'T want HR to clear by sending empty strings, then block here.
    changed.push({ key: k, from: fromVal, to: toVal });
  });

  // Sort: show common employee fields first by LABELS, then rest
  changed.sort((x, y) => {
    const ax = LABELS[x.key] ? 0 : 1;
    const ay = LABELS[y.key] ? 0 : 1;
    if (ax !== ay) return ax - ay;
    return x.key.localeCompare(y.key);
  });

  return changed;
}

export default function AdminApprovalsPage() {
  const { data: pending = [], refetch, isFetching } = useGetPendingQuery();
  const [approve, { isLoading: approving }] = useApproveMutation();
  const [reject, { isLoading: rejecting }] = useRejectMutation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const selected = useMemo(() => {
    if (!pending?.length) return null;
    return pending.find((x: any) => x._id === selectedId) || pending[0];
  }, [pending, selectedId]);

  const diffRows = useMemo(() => {
    if (!selected) return [];
    // Prefer: selected.after (sanitized) → else selected.payload
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

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Approvals</h1>
          <p className="text-sm text-slate-500">
            Review HR change requests and approve/reject them.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-md border bg-white text-sm hover:bg-slate-50"
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT: Pending list */}
        <div className="col-span-12 md:col-span-4 bg-white rounded-xl border">
          <div className="px-4 py-3 border-b">
            <div className="text-sm font-semibold text-slate-800">
              Pending ({pending?.length || 0})
            </div>
          </div>

          <div className="divide-y">
            {(pending || []).map((r: any) => (
              <button
                key={r._id}
                onClick={() => setSelectedId(r._id)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${
                  (selected?._id === r._id) ? "bg-slate-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    {r.modelName} • {r.action}
                  </div>
                  <div className="text-xs text-slate-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Module: {r.module} • By: {r.requestedByRole}
                </div>
              </button>
            ))}

            {(!pending || pending.length === 0) && (
              <div className="px-4 py-8 text-sm text-slate-500">
                No pending approvals.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Approval details */}
        <div className="col-span-12 md:col-span-8 bg-white rounded-xl border">
          <div className="px-5 py-4 border-b">
            <div className="text-sm font-semibold text-slate-900">
              Review request
            </div>
          </div>

          {!selected ? (
            <div className="p-6 text-sm text-slate-500">Select a request.</div>
          ) : (
            <div className="p-5">
              {/* Summary chips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="border rounded-lg p-3">
                  <div className="text-xs text-slate-500">Model</div>
                  <div className="text-sm font-semibold">{selected.modelName}</div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-xs text-slate-500">Action</div>
                  <div className="text-sm font-semibold">{selected.action}</div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-xs text-slate-500">Target</div>
                  <div className="text-sm font-semibold break-all">
                    {selected.targetId || "—"}
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-xs text-slate-500">Requested By</div>
                  <div className="text-sm font-semibold">
                    {selected.requestedByRole || "—"}
                  </div>
                </div>
              </div>

              {/* Human-friendly employee line */}
              {selected.modelName === "Employee" && (
                <div className="mb-4 rounded-lg border bg-slate-50 p-3">
                  <div className="text-xs text-slate-600">Approval summary</div>
                  <div className="text-sm font-semibold text-slate-900">
                    HR wants to update Employee{" "}
                    <span className="font-bold">{employeeTitle || selected.targetId}</span>
                  </div>
                </div>
              )}

              {/* Changes table */}
              <div className="mb-4">
                <div className="text-sm font-semibold text-slate-900 mb-2">
                  Changes requested
                </div>

                {diffRows.length === 0 ? (
                  <div className="text-sm text-slate-500 border rounded-lg p-4">
                    No actual changes detected (payload matches current data).
                  </div>
                ) : (
                  <div className="overflow-hidden border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left">
                          <th className="px-3 py-2 font-semibold text-slate-700">
                            Field
                          </th>
                          <th className="px-3 py-2 font-semibold text-slate-700">
                            Before
                          </th>
                          <th className="px-3 py-2 font-semibold text-slate-700">
                            After
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {diffRows.map((row) => (
                          <tr key={row.key} className="align-top">
                            <td className="px-3 py-2 font-medium text-slate-900">
                              {LABELS[row.key] || row.key}
                            </td>
                            <td className="px-3 py-2 text-slate-700">
                              {formatValue(row.from)}
                            </td>
                            <td className="px-3 py-2 text-slate-900">
                              {formatValue(row.to)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Reject reason */}
              <div className="mb-4">
                <div className="text-sm font-semibold text-slate-900 mb-2">
                  Reject reason (optional)
                </div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full min-h-[110px] border rounded-lg p-3 text-sm"
                  placeholder="Write reason if rejecting..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onApprove}
                  disabled={approving || rejecting || diffRows.length === 0}
                  className="px-6 py-2 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                >
                  {approving ? "Approving..." : "Approve"}
                </button>

                <button
                  onClick={onReject}
                  disabled={approving || rejecting}
                  className="px-6 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                >
                  {rejecting ? "Rejecting..." : "Reject"}
                </button>
              </div>

              {/* tiny note */}
              <div className="mt-3 text-xs text-slate-500">
                Approve will apply the changes to the database. Reject keeps current values unchanged.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
