import BaseWidget from "./BaseWidget";
import { useGetMyActionsQuery } from "../../../features/dashboard/dashboardApi";

export default function MyActionSummaryWidget() {
  const { data, isLoading } = useGetMyActionsQuery();

  const total =
    (data?.pendingLeaveApprovals || 0) +
    (data?.pendingTimesheets || 0) +
    (data?.pendingClaims || 0);

  return (
    <BaseWidget title="My Actions" icon="📋">
      {isLoading ? (
        <div className="text-xs text-slate-400">Loading…</div>
      ) : total === 0 ? (
        <div className="h-[220px] flex flex-col items-center justify-center text-center">
          <div className="w-28 h-28 rounded-2xl bg-slate-50 border border-slate-100" />
          <div className="mt-3 text-[11px] text-slate-400">
            No Pending Actions to Perform
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Leave Approvals</span>
            <span className="font-semibold">{data?.pendingLeaveApprovals || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Timesheets</span>
            <span className="font-semibold">{data?.pendingTimesheets || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Claims</span>
            <span className="font-semibold">{data?.pendingClaims || 0}</span>
          </div>
        </div>
      )}
    </BaseWidget>
  );
}
