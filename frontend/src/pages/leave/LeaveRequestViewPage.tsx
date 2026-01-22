import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetLeaveByIdQuery,
  useUpdateLeaveStatusMutation,
  LeaveStatus,
} from "../../features/leave/leaveApi";
import { selectAuthRole } from "../../features/auth/selectors";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const boxCls =
  "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
const btnBase =
  "px-3 h-9 rounded-lg text-sm font-semibold border disabled:opacity-60";
const btnPrimary =
  "bg-[#f7941d] border-[#f7941d] text-white hover:brightness-95";
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

export default function LeaveRequestViewPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const role = useSelector(selectAuthRole);

  const { data, isLoading, isError, refetch } = useGetLeaveByIdQuery(id || "", {
    skip: !id,
  });

  const [updateStatus, { isLoading: updating }] = useUpdateLeaveStatusMutation();
  const [remarks, setRemarks] = useState("");

  const leave = data as any;

  const canDecide = useMemo(() => {
    if (!leave) return false;
    if (leave.status !== "PENDING") return false;
    return role === "ADMIN" || role === "HR" || role === "SUPERVISOR";
  }, [leave, role]);

  async function handleDecision(status: LeaveStatus) {
    if (!id) return;
    try {
      // your mutation currently only sends { id, status }
      // but backend supports remarks in controller; keep safe:
      await updateStatus({ id, status, remarks } as any).unwrap();
      await refetch();
      nav("/leave/list");
    } catch (e) {
      console.error(e);
      alert("Failed to update leave status. Check console/network.");
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
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-xl font-bold text-slate-900">Leave Request</div>
          <div className="text-xs text-slate-500 mt-1">ID: {id}</div>
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
          Failed to load leave details. Make sure the backend route `/api/leave/:id`
          is added and you are logged in with proper role.
        </div>
      )}

      {!isLoading && leave && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className={boxCls}>
              <div className="text-sm font-bold text-slate-900 mb-3">
                Leave Details
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className={labelCls}>Employee</div>
                  <div className="text-sm text-slate-900 font-semibold">
                    {leave?.employee?.firstName
                      ? `${leave.employee.firstName} ${leave.employee.lastName || ""}`
                      : leave?.employee?.name || "--"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {leave?.employee?.employeeId || leave?.employee?._id || ""}
                  </div>
                </div>

                <div>
                  <div className={labelCls}>Leave Type</div>
                  <div className="text-sm text-slate-900 font-semibold">
                    {getTypeName(leave.type)}
                  </div>
                </div>

                <div>
                  <div className={labelCls}>Status</div>
                  <div className="text-sm font-semibold">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] border ${
                        leave.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : leave.status === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : leave.status === "CANCELLED"
                          ? "bg-slate-100 text-slate-700 border-slate-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                </div>

                <div>
                  <div className={labelCls}>From</div>
                  <div className="text-sm text-slate-900 font-semibold">
                    {fmtDate(leave.startDate || leave.fromDate)}
                  </div>
                </div>

                <div>
                  <div className={labelCls}>To</div>
                  <div className="text-sm text-slate-900 font-semibold">
                    {fmtDate(leave.endDate || leave.toDate)}
                  </div>
                </div>

                <div>
                  <div className={labelCls}>Days</div>
                  <div className="text-sm text-slate-900 font-semibold">
                    {leave.days ?? "--"}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className={labelCls}>Reason</div>
                <div className="text-sm text-slate-800">
                  {leave.reason || "--"}
                </div>
              </div>
            </div>

            {/* History */}
            <div className={boxCls}>
              <div className="text-sm font-bold text-slate-900 mb-3">
                History
              </div>

              {Array.isArray(leave.history) && leave.history.length > 0 ? (
                <div className="space-y-2">
                  {leave.history
                    .slice()
                    .reverse()
                    .map((h: any, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-xs font-bold text-slate-900">
                            {h.action}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {fmtDateTime(h.at)}
                          </div>
                        </div>
                        <div className="mt-1 text-[12px] text-slate-600">
                          By: <span className="font-semibold">{h.byRole || "--"}</span>
                        </div>
                        {h.remarks ? (
                          <div className="mt-1 text-[12px] text-slate-700">
                            Remarks: {h.remarks}
                          </div>
                        ) : null}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No history found.</div>
              )}
            </div>
          </div>

          {/* Right: Approval + Actions */}
          <div className="space-y-4">
            <div className={boxCls}>
              <div className="text-sm font-bold text-slate-900 mb-3">
                Approval Info
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <div className={labelCls}>Supervisor Action</div>
                  <div className="text-slate-900 font-semibold">
                    {leave?.approval?.supervisorAction || "--"}
                  </div>
                  {leave?.approval?.supervisorActedAt ? (
                    <div className="text-xs text-slate-500">
                      At: {fmtDateTime(leave.approval.supervisorActedAt)}
                    </div>
                  ) : null}
                  {leave?.approval?.supervisorRemarks ? (
                    <div className="text-xs text-slate-600 mt-1">
                      Remarks: {leave.approval.supervisorRemarks}
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <div className={labelCls}>Admin Action</div>
                  <div className="text-slate-900 font-semibold">
                    {leave?.approval?.adminAction || "--"}
                  </div>
                  {leave?.approval?.adminActedAt ? (
                    <div className="text-xs text-slate-500">
                      At: {fmtDateTime(leave.approval.adminActedAt)}
                    </div>
                  ) : null}
                  {leave?.approval?.adminRemarks ? (
                    <div className="text-xs text-slate-600 mt-1">
                      Remarks: {leave.approval.adminRemarks}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className={boxCls}>
              <div className="text-sm font-bold text-slate-900 mb-3">
                Actions
              </div>

              <div>
                <div className={labelCls}>Comments / Remarks (optional)</div>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]"
                  placeholder="Write a comment (optional)"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  (Your backend supports remarks in history — if you want this to be sent,
                  tell me and I’ll update the mutation safely.)
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  className={`${btnBase} ${btnApprove} flex-1`}
                  disabled={!canDecide || updating}
                  onClick={() => handleDecision("APPROVED")}
                >
                  Approve
                </button>
                <button
                  className={`${btnBase} ${btnReject} flex-1`}
                  disabled={!canDecide || updating}
                  onClick={() => handleDecision("REJECTED")}
                >
                  Reject
                </button>
              </div>

              {!canDecide ? (
                <div className="text-xs text-slate-500 mt-3">
                  You can’t take action on this request (either not pending or role not allowed).
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
