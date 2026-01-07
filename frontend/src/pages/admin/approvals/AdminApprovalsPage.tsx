import { useMemo, useState } from "react";
import {
  useApproveMutation,
  useGetPendingQuery,
  useRejectMutation,
  ChangeRequest,
} from "../../../features/changeRequests/changeRequestsApi";

function pretty(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export default function AdminApprovalsPage() {
  const { data = [], isLoading, isError, refetch } = useGetPendingQuery();
  const [approve, { isLoading: approving }] = useApproveMutation();
  const [reject, { isLoading: rejecting }] = useRejectMutation();

  const [selected, setSelected] = useState<ChangeRequest | null>(null);
  const [decisionReason, setDecisionReason] = useState("");

  const rows = useMemo(() => data, [data]);

  async function onApprove(id: string) {
    await approve({ id }).unwrap();
    setSelected(null);
    setDecisionReason("");
  }

  async function onReject(id: string) {
    await reject({ id, decisionReason }).unwrap();
    setSelected(null);
    setDecisionReason("");
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Approvals</h1>
          <p className="text-sm text-slate-600">
            Review HR change requests and approve/reject them.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {isLoading && (
        <div className="text-sm text-slate-600">Loading pending approvals…</div>
      )}

      {isError && (
        <div className="text-sm text-red-600">
          Failed to load approvals. (Login as ADMIN)
        </div>
      )}

      {!isLoading && !rows.length && (
        <div className="text-sm text-slate-600 bg-white border border-slate-200 rounded-lg p-4">
          No pending approvals 🎉
        </div>
      )}

      {!!rows.length && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left list */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 text-sm font-semibold text-slate-800">
              Pending ({rows.length})
            </div>

            <div className="divide-y divide-slate-200">
              {rows.map((r) => (
                <button
                  key={r._id}
                  onClick={() => setSelected(r)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${
                    selected?._id === r._id ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-900">
                      {r.modelName} • {r.action}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Module: {r.module} • By: {r.requestedByRole}
                  </div>
                  {!!r.reason && (
                    <div className="text-xs text-slate-500 mt-1">
                      Reason: {r.reason}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right detail */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 text-sm font-semibold text-slate-800">
              {selected ? "Review request" : "Select a request"}
            </div>

            {!selected ? (
              <div className="p-4 text-sm text-slate-600">
                Select a pending request from the left.
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Model</div>
                    <div className="font-medium text-slate-900">{selected.modelName}</div>
                  </div>
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Action</div>
                    <div className="font-medium text-slate-900">{selected.action}</div>
                  </div>
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Target</div>
                    <div className="font-medium text-slate-900">
                      {selected.targetId || "—"}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Requested By</div>
                    <div className="font-medium text-slate-900">
                      {selected.requestedByRole}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-800 mb-2">
                    Payload
                  </div>
                  <pre className="text-xs bg-slate-950 text-slate-100 rounded-lg p-3 overflow-auto max-h-[360px]">
{pretty(selected.payload)}
                  </pre>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reject reason (optional)
                  </label>
                  <textarea
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    className="w-full min-h-[90px] rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={approving || rejecting}
                    onClick={() => onApprove(selected._id)}
                    className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    disabled={approving || rejecting}
                    onClick={() => onReject(selected._id)}
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
