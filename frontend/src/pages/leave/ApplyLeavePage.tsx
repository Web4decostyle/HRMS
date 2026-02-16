// frontend/src/pages/leave/ApplyLeavePage.tsx
import { useMemo, useState } from "react";
import {
  useApplyLeaveMutation,
  useGetLeaveTypesQuery,
} from "../../features/leave/leaveApi";

import LeaveModuleTabs from "./LeaveModuleTabs";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a]/40";
const selectCls = inputCls;

function toLocalISODate(d: Date) {
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function parseDateInput(v: string) {
  return new Date(`${v}T00:00:00`);
}

export default function ApplyLeavePage() {
  const todayStr = toLocalISODate(new Date());

  const [typeId, setTypeId] = useState("");
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [reason, setReason] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: leaveTypes = [], isLoading: typesLoading } =
    useGetLeaveTypesQuery();

  const [applyLeave, { isLoading: applying }] = useApplyLeaveMutation();

  const requestedDays = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const s = parseDateInput(fromDate);
    const e = parseDateInput(toDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
    if (e < s) return 0;
    const diff = Math.round((e.getTime() - s.getTime()) / 86_400_000);
    return diff + 1;
  }, [fromDate, toDate]);

  const canSubmit = useMemo(() => {
    if (applying) return false;
    if (!typeId || !fromDate || !toDate) return false;
    if (requestedDays <= 0) return false;
    return true;
  }, [applying, typeId, fromDate, toDate, requestedDays]);

  async function handleApply() {
    setError(null);
    setSuccess(null);

    if (!typeId) return setError("Please select a leave type.");
    if (!fromDate || !toDate) return setError("Please select From and To date.");

    const s = parseDateInput(fromDate);
    const e = parseDateInput(toDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      return setError("Please select valid dates.");
    }
    if (e < s) return setError("To date cannot be before From date.");

    try {
      await applyLeave({
        typeId,
        fromDate,
        toDate,
        reason: reason?.trim() || undefined,
      }).unwrap();

      setSuccess("Leave applied successfully!");
      setReason("");
    } catch (err: any) {
      setError(err?.data?.message || "Failed to apply leave");
    }
  }

  return (
    <div className="h-full bg-[#f5f6fa] px-3 sm:px-6 py-4 overflow-y-auto">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-slate-900">
            Leave
          </h1>
          <p className="text-[12px] text-slate-500">
            Apply leave and track your requests
          </p>
        </div>

        <LeaveModuleTabs activeKey="apply" />

        {/* Apply form */}
        <div className="rounded-[18px] border border-[#e5e7f0] bg-white shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#eef0f6]">
            <div className="text-[14px] font-semibold text-slate-900">
              Apply Leave
            </div>
            <div className="text-[12px] text-slate-500">
              Select leave type, dates and submit
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">
                {success}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Leave Type *</label>
                <select
                  className={selectCls}
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  disabled={typesLoading}
                >
                  <option value="">Select</option>
                  {leaveTypes.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>From Date *</label>
                <input
                  type="date"
                  className={inputCls}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={toDate || undefined}
                />
              </div>

              <div>
                <label className={labelCls}>To Date *</label>
                <input
                  type="date"
                  className={inputCls}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate || undefined}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Comments</label>
              <textarea
                className="w-full h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a]/40"
                placeholder="Optional reason for leave"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-[12px] text-slate-600">
                Requested:{" "}
                <span className="font-semibold text-slate-900">
                  {requestedDays}
                </span>{" "}
                day(s)
              </div>

              <button
                className="w-full sm:w-auto px-6 h-10 rounded-full bg-[#8bc34a] text-white font-semibold text-[13px] hover:bg-[#7cb342] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleApply}
                disabled={!canSubmit}
              >
                {applying ? "Applying..." : "Apply"}
              </button>
            </div>

            <div className="text-[11px] text-slate-400">* Required</div>
          </div>
        </div>
      </div>
    </div>
  );
}
