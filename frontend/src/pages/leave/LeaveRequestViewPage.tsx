// frontend/src/pages/leave/LeaveRequestViewPage.tsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetLeaveByIdQuery,
  useUpdateLeaveStatusMutation,
  LeaveStatus,
  PendingWith,
} from "../../features/leave/leaveApi";
import { selectAuthRole } from "../../features/auth/selectors";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const boxCls = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const btnBase =
  "px-3 h-9 rounded-xl text-[12px] font-semibold border disabled:opacity-60";
const btnOutline =
  "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";
const btnApprove =
  "bg-emerald-600 border-emerald-600 text-white hover:brightness-95";
const btnReject =
  "bg-rose-600 border-rose-600 text-white hover:brightness-95";

function fmtDate(d?: string) {
  if (!d) return "--";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toISOString().slice(0, 10);
}

function fmtDateTime(d?: string) {
  if (!d) return "--";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleString();
}

function getTypeName(t: any) {
  if (!t) return "--";
  if (typeof t === "string") return t;
  return t.name || t.code || "--";
}

function mapPendingWithLabel(pw: PendingWith) {
  if (pw === "MANAGER" || pw === "SUPERVISOR") return "Manager";
  if (pw === "ADMIN" || pw === "HR") return "Admin";
  return null;
}

function canUserActOnLeave(
  role: string,
  status: LeaveStatus,
  pendingWith?: PendingWith
) {
  if (status !== "PENDING") return false;

  // Admin/HR can act on any pending
  if (role === "ADMIN" || role === "HR") return true;

  // Supervisor can act only when pending is with Manager/Supervisor
  const pw = mapPendingWithLabel(pendingWith);
  if (role === "SUPERVISOR" && pw === "Manager") return true;

  return false;
}

function Timeline({ items }: { items: any[] }) {
  // oldest -> newest
  const sorted = (items || [])
    .slice()
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  if (!sorted.length) {
    return <div className="text-sm text-slate-500">No history found.</div>;
  }

  return (
    <div className="relative pl-6">
      {/* line */}
      <div className="absolute left-[10px] top-1 bottom-1 w-px bg-slate-200" />

      <div className="space-y-4">
        {sorted.map((h, idx) => {
          const isLast = idx === sorted.length - 1;
          const action = String(h.action || "").toUpperCase();

          const tone =
            action.includes("APPROV")
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : action.includes("REJECT")
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : action.includes("CANCEL")
              ? "bg-slate-100 border-slate-200 text-slate-700"
              : "bg-amber-50 border-amber-200 text-amber-800";

          return (
            <div key={idx} className="relative">
              {/* dot */}
              <div
                className={[
                  "absolute -left-[2px] top-1.5 h-3 w-3 rounded-full border",
                  action.includes("APPROV")
                    ? "bg-emerald-500 border-emerald-200"
                    : action.includes("REJECT")
                    ? "bg-rose-500 border-rose-200"
                    : action.includes("CANCEL")
                    ? "bg-slate-500 border-slate-200"
                    : "bg-amber-500 border-amber-200",
                ].join(" ")}
              />

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full border text-[11px] font-bold ${tone}`}>
                      {h.action || "UPDATE"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {fmtDateTime(h.at)}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    By:{" "}
                    <span className="font-semibold text-slate-700">
                      {h.byRole || "--"}
                    </span>
                  </div>
                </div>

                {h.remarks ? (
                  <div className="mt-2 text-[12px] text-slate-700">
                    <span className="font-semibold">Remarks:</span> {h.remarks}
                  </div>
                ) : null}

                {!isLast ? (
                  <div className="mt-2 text-[10px] text-slate-400">
                    {/* subtle hint */}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LeaveRequestViewPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const role = useSelector(selectAuthRole) ?? "ESS";

  const { data, isLoading, isError, refetch } = useGetLeaveByIdQuery(id || "", {
    skip: !id,
  });

  const [updateStatus, { isLoading: updating }] = useUpdateLeaveStatusMutation();
  const [remarks, setRemarks] = useState("");

  const leave = data as any;
  const pendingWith = (leave as any)?.pendingWith as PendingWith;
  const pendingLabel = leave?.status === "PENDING" ? mapPendingWithLabel(pendingWith) : null;

  const canAct = useMemo(() => {
    return canUserActOnLeave(role, leave?.status, pendingWith);
  }, [role, leave?.status, pendingWith]);

  async function handleDecision(status: LeaveStatus) {
    if (!id) return;
    try {
      await updateStatus({ id, status, remarks } as any).unwrap();
      await refetch();
      nav("/leave");
    } catch (e: any) {
      alert(e?.data?.message || "Failed to update leave status.");
    }
  }

  if (!id) {
    return (
      <div className="p-6">
        <div className={boxCls}>Invalid leave id</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-[#f5f6fa] min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[18px] font-extrabold text-slate-900">
            Leave Request
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ID: <span className="font-semibold text-slate-700">{id}</span>
          </div>
          {leave?.status === "PENDING" && pendingLabel ? (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#fbd7a5] bg-[#fef4ea] text-[11px] font-bold text-[#b86200]">
              Pending with: {pendingLabel}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button className={`${btnBase} ${btnOutline}`} onClick={() => nav(-1)}>
            Back
          </button>
          <button
            className={`${btnBase} ${btnOutline}`}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading && <div className={boxCls}>Loading...</div>}
      {isError && (
        <div className={boxCls}>
          Failed to load leave details. Make sure `/api/leave/:id` works and your
          role has access.
        </div>
      )}

      {!isLoading && leave && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Details + Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <div className={boxCls}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-[13px] font-extrabold text-slate-900">
                  Leave Details
                </div>

                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-[11px] border font-bold ${
                    leave.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : leave.status === "REJECTED"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : leave.status === "CANCELLED"
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {leave.status}
                  {leave.status === "PENDING" && pendingLabel
                    ? ` • ${pendingLabel}`
                    : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className={labelCls}>Employee</div>
                  <div className="text-[13px] text-slate-900 font-bold">
                    {leave?.employee?.firstName
                      ? `${leave.employee.firstName} ${leave.employee.lastName || ""}`
                      : leave?.employee?.name || "--"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {leave?.employee?.employeeId || leave?.employee?._id || ""}
                  </div>
                </div>

                <div>
                  <div className={labelCls}>Leave Type</div>
                  <div className="text-[13px] text-slate-900 font-bold">
                    {getTypeName(leave.type)}
                  </div>
                </div>

                <div>
                  <div className={labelCls}>Days</div>
                  <div className="text-[13px] text-slate-900 font-bold">
                    {leave.days ?? "--"}
                  </div>
                </div>

                <div>
                  <div className={labelCls}>From</div>
                  <div className="text-[13px] text-slate-900 font-bold">
                    {fmtDate(leave.startDate || leave.fromDate)}
                  </div>
                </div>

                <div>
                  <div className={labelCls}>To</div>
                  <div className="text-[13px] text-slate-900 font-bold">
                    {fmtDate(leave.endDate || leave.toDate)}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className={labelCls}>Reason</div>
                <div className="text-[13px] text-slate-800">
                  {leave.reason || "--"}
                </div>
              </div>
            </div>

            <div className={boxCls}>
              <div className="text-[13px] font-extrabold text-slate-900 mb-3">
                Approval History
              </div>
              <Timeline items={leave.history || []} />
            </div>
          </div>

          {/* Right: Approval summary + Actions */}
          <div className="space-y-4">
            <div className={boxCls}>
              <div className="text-[13px] font-extrabold text-slate-900 mb-3">
                Approval Summary
              </div>

              <div className="space-y-3 text-[12px]">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="text-[11px] text-slate-500 font-bold">
                    Manager/Supervisor
                  </div>
                  <div className="mt-1 text-slate-900 font-extrabold">
                    {leave?.approval?.supervisorAction || "--"}
                  </div>
                  {leave?.approval?.supervisorActedAt ? (
                    <div className="text-[11px] text-slate-500 mt-1">
                      At: {fmtDateTime(leave.approval.supervisorActedAt)}
                    </div>
                  ) : null}
                  {leave?.approval?.supervisorRemarks ? (
                    <div className="text-[11px] text-slate-600 mt-1">
                      Remarks: {leave.approval.supervisorRemarks}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="text-[11px] text-slate-500 font-bold">
                    Admin/HR
                  </div>
                  <div className="mt-1 text-slate-900 font-extrabold">
                    {leave?.approval?.adminAction || "--"}
                  </div>
                  {leave?.approval?.adminActedAt ? (
                    <div className="text-[11px] text-slate-500 mt-1">
                      At: {fmtDateTime(leave.approval.adminActedAt)}
                    </div>
                  ) : null}
                  {leave?.approval?.adminRemarks ? (
                    <div className="text-[11px] text-slate-600 mt-1">
                      Remarks: {leave.approval.adminRemarks}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className={boxCls}>
              <div className="text-[13px] font-extrabold text-slate-900 mb-3">
                Actions
              </div>

              {!canAct ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[12px] text-slate-600">
                  You can’t take action on this request (either not pending, or
                  not assigned to your role).
                </div>
              ) : (
                <>
                  <div>
                    <div className={labelCls}>Comments / Remarks (optional)</div>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]"
                      placeholder="Write a comment (optional)"
                    />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      className={`${btnBase} ${btnApprove} flex-1`}
                      disabled={updating}
                      onClick={() => handleDecision("APPROVED")}
                    >
                      Approve
                    </button>
                    <button
                      className={`${btnBase} ${btnReject} flex-1`}
                      disabled={updating}
                      onClick={() => handleDecision("REJECTED")}
                    >
                      Reject
                    </button>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-500">
                    Note: Backend will still enforce assignment (especially for
                    Supervisor approvals).
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
