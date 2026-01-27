import React from "react";

export type LeaveBalanceItem = {
  leaveTypeId: string;
  leaveTypeName: string;
  allotted: number;
  used: number;
  pending: number;
  balance: number;
};

type Props = {
  isLoading?: boolean;
  isError?: boolean;
  items?: LeaveBalanceItem[];
};

const cardCls =
  "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
const titleCls =
  "text-sm font-semibold text-slate-700";
const metaCls =
  "text-xs text-slate-500";

export default function LeaveBalancePanel({ isLoading, isError, items }: Props) {
  return (
    <div className="space-y-3">
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">Leave Balance</h3>
          <span className="text-[11px] text-slate-500">Current year</span>
        </div>

        {isLoading ? (
          <div className="mt-3 text-sm text-slate-500">Loading balances…</div>
        ) : isError ? (
          <div className="mt-3 text-sm text-red-600">
            Failed to load leave balance.
          </div>
        ) : !items?.length ? (
          <div className="mt-3 text-sm text-slate-500">
            No leave balance available.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((b) => (
              <div key={b.leaveTypeId} className="rounded-lg bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={titleCls}>{b.leaveTypeName}</div>
                    <div className={metaCls}>
                      Allotted: {b.allotted} • Used: {b.used} • Pending: {b.pending}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">Balance</div>
                    <div className="text-lg font-bold text-slate-800">
                      {b.balance}
                    </div>
                  </div>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                  {(() => {
                    const total = Math.max(1, b.allotted);
                    const usedPct = Math.min(100, Math.round((b.used / total) * 100));
                    const pendingPct = Math.min(
                      100 - usedPct,
                      Math.round((b.pending / total) * 100)
                    );

                    return (
                      <div className="flex h-full w-full">
                        <div className="h-full bg-slate-400" style={{ width: `${usedPct}%` }} />
                        <div className="h-full bg-slate-300" style={{ width: `${pendingPct}%` }} />
                        <div className="h-full flex-1 bg-transparent" />
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                  <span>Used</span>
                  <span>Pending</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={cardCls}>
        <div className="text-sm font-semibold text-slate-800">Tips</div>
        <ul className="mt-2 list-disc pl-5 text-xs text-slate-600 space-y-1">
          <li>Pending leaves reduce approval capacity until processed.</li>
          <li>If balance is missing, ask admin to allocate balances to your profile.</li>
        </ul>
      </div>
    </div>
  );
}
