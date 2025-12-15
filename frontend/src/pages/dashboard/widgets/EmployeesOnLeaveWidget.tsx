import BaseWidget from "./BaseWidget";
import { useGetEmployeesOnLeaveTodayQuery } from "../../../features/dashboard/dashboardApi";

export default function EmployeesOnLeaveWidget() {
  const { data, isLoading } = useGetEmployeesOnLeaveTodayQuery();

  const total = data?.total ?? 0;

  return (
    <BaseWidget title="Employees on Leave Today" icon="🏖️">
      {isLoading ? (
        <div className="text-xs text-slate-400">Loading…</div>
      ) : total === 0 ? (
        <div className="h-[220px] flex flex-col items-center justify-center text-center">
          <div className="w-28 h-28 rounded-2xl bg-slate-50 border border-slate-100" />
          <div className="mt-3 text-[11px] text-slate-400">
            No Employees are on Leave Today
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-700">
          <div className="text-xs text-slate-500">Total</div>
          <div className="text-3xl font-semibold">{total}</div>
        </div>
      )}
    </BaseWidget>
  );
}
