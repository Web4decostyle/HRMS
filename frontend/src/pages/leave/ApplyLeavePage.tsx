// frontend/src/pages/leave/ApplyLeavePage.tsx
import { useMemo, useState } from "react";
import {
  useApplyLeaveMutation,
  useGetLeaveTypesQuery,
  useGetMyLeaveBalanceQuery,
} from "../../features/leave/leaveApi";

import LeaveModuleTabs from "./LeaveModuleTabs";
import LeaveBalancePanel from "../../components/leave/LeaveBalancePanel";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a]/40";
const selectCls = inputCls;

function toLocalISODate(d: Date) {
  // Avoid UTC shift from toISOString() for <input type="date" />
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function parseDateInput(v: string) {
  // Parse as local midnight to avoid timezone shifts
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

  const {
    data: balanceItems = [],
    isLoading: balanceLoading,
    isError: balanceIsError,
  } = useGetMyLeaveBalanceQuery();

  const [applyLeave, { isLoading: applying }] = useApplyLeaveMutation();

  const balanceByType = useMemo(() => {
    const m = new Map<string, (typeof balanceItems)[number]>();
    for (const b of balanceItems) m.set(b.leaveTypeId, b);
    return m;
  }, [balanceItems]);

  const selectedBalance = useMemo(() => {
    if (!typeId) return null;
    return balanceByType.get(typeId) || null;
  }, [balanceByType, typeId]);

  const requestedDays = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const s = parseDateInput(fromDate);
    const e = parseDateInput(toDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
    if (e < s) return 0;
    const diff = Math.round((e.getTime() - s.getTime()) / 86_400_000);
    return diff + 1; // inclusive
  }, [fromDate, toDate]);

  const hasAnyBalance = useMemo(() => balanceItems.length > 0, [balanceItems]);

  const canSubmit = useMemo(() => {
    if (applying) return false;
    if (!typeId || !fromDate || !toDate) return false;
    if (requestedDays <= 0) return false;

    // If balance is present for selected type, block when insufficient.
    if (selectedBalance) return requestedDays <= (selectedBalance.balance ?? 0);

    // If user has NO balance allocated at all, block apply (matches backend validation)
    if (!balanceLoading && !hasAnyBalance) return false;

    // If they have balance for some types but not this type -> block
    if (!balanceLoading && hasAnyBalance && !selectedBalance) return false;

    return true;
  }, [
    applying,
    typeId,
    fromDate,
    toDate,
    requestedDays,
    selectedBalance,
    balanceLoading,
    hasAnyBalance,
  ]);

  async function handleApply() {
    setError(null);
    setSuccess(null);

    if (!typeId) {
      setError("Please select a leave type.");
      return;
    }
    if (!fromDate || !toDate) {
      setError("Please select From and To date.");
      return;
    }

    const s = parseDateInput(fromDate);
    const e = parseDateInput(toDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      setError("Please select valid dates.");
      return;
    }
    if (e < s) {
      setError("To date cannot be before From date.");
      return;
    }

    if (!balanceLoading) {
      if (!hasAnyBalance) {
        setError("No leave balance is allocated to you. Please contact HR/Admin.");
        return;
      }
      if (!selectedBalance) {
        setError("No leave balance is allocated for this leave type.");
        return;
      }
      if (requestedDays > (selectedBalance.balance ?? 0)) {
        setError(
          `Insufficient leave balance. Available: ${selectedBalance.balance ?? 0} day(s), Requested: ${requestedDays} day(s).`
        );
        return;
      }
    }

    try {
      await applyLeave({
        typeId,
        fromDate,
        toDate,
        reason: reason?.trim() || undefined,
      }).unwrap();

      setSuccess("Leave applied successfully!");
      setReason("");
      // Keep selected type/date (many users apply multiple times)
    } catch (err: any) {
      setError(err?.data?.message || "Failed to apply leave");
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900">Leave</h1>
        <p className="text-[12px] text-slate-500">
          Apply leave and track your requests
        </p>
      </div>

      <LeaveModuleTabs activeKey="apply" />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Balance */}
        <div className="xl:col-span-4">
          <LeaveBalancePanel
            items={balanceItems as any}
            isLoading={balanceLoading}
            isError={balanceIsError}
          />
        </div>

        {/* Apply form */}
        <div className="xl:col-span-8">
          <div className="rounded-[18px] border border-[#e5e7f0] bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-[#eef0f6]">
              <div className="text-[14px] font-semibold text-slate-900">
                Apply Leave
              </div>
              <div className="text-[12px] text-slate-500">
                Select leave type, dates and submit
              </div>
            </div>

            <div className="p-6 space-y-5">
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

              {!balanceLoading && !hasAnyBalance && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
                  No leave balance is allocated to you. Ask HR/Admin to assign
                  leave entitlements.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Leave Type *</label>
                  <select
                    className={selectCls}
                    value={typeId}
                    onChange={(e) => setTypeId(e.target.value)}
                    disabled={typesLoading || (!balanceLoading && !hasAnyBalance)}
                  >
                    <option value="">Select</option>
                    {leaveTypes.map((t) => {
                      const b = balanceByType.get(t._id);
                      const label = b
                        ? `${t.name} (Bal: ${b.balance})`
                        : `${t.name} (No balance)`;
                      return (
                        <option
                          key={t._id}
                          value={t._id}
                          disabled={!b || (b.balance ?? 0) <= 0}
                        >
                          {label}
                        </option>
                      );
                    })}
                  </select>

                  {typeId && !selectedBalance && !balanceLoading && hasAnyBalance && (
                    <div className="mt-1 text-[12px] text-rose-600">
                      No balance for selected leave type.
                    </div>
                  )}

                  {selectedBalance && (
                    <div className="mt-1 text-[12px] text-slate-600">
                      Available:{" "}
                      <span className="font-semibold text-slate-900">
                        {selectedBalance.balance}
                      </span>{" "}
                      day(s) • Pending: {selectedBalance.pending} • Used:{" "}
                      {selectedBalance.used}
                    </div>
                  )}
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

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-[12px] text-slate-600">
                  Requested:{" "}
                  <span className="font-semibold text-slate-900">
                    {requestedDays}
                  </span>{" "}
                  day(s)
                  {selectedBalance &&
                    requestedDays > (selectedBalance.balance ?? 0) && (
                      <span className="ml-2 text-rose-600 font-semibold">
                        (Insufficient balance)
                      </span>
                    )}
                </div>

                <button
                  className="px-6 h-10 rounded-full bg-[#8bc34a] text-white font-semibold text-[13px] hover:bg-[#7cb342] disabled:opacity-60 disabled:cursor-not-allowed"
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
    </div>
  );
}
