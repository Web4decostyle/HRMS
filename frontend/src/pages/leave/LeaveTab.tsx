import { useMemo } from "react";
import {
  useGetMyLeavesQuery,
  useGetAllLeavesQuery,
  LeaveRequest,
} from "../../features/leave/leaveApi";

type Props = {
  /** When provided, we show leave for that employee (HR/Admin view in PIM). */
  employeeId?: string;
};

export default function LeaveTab({ employeeId }: Props) {
  const isPimView = Boolean(employeeId);

  const {
    data: myLeaves = [],
    isLoading: myLoading,
  } = useGetMyLeavesQuery(undefined, {
    skip: isPimView,
  });

  const {
    data: employeeLeaves = [],
    isLoading: employeeLoading,
  } = useGetAllLeavesQuery(
    {
      employeeId,
      status: "APPROVED",
    },
    {
      skip: !isPimView,
    }
  );

  const leaves: LeaveRequest[] = useMemo(() => {
    if (isPimView) return employeeLeaves;
    // For the user's own profile, show only approved leaves
    return myLeaves.filter((l) => l.status === "APPROVED");
  }, [isPimView, employeeLeaves, myLeaves]);

  const loading = isPimView ? employeeLoading : myLoading;

  return (
    <div className="bg-white rounded-xl border border-[#e5e7f0] shadow-sm">
      <div className="px-6 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Approved Leave
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">
          This section updates automatically once your leave is fully approved.
        </p>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <p className="text-[11px] text-slate-500">Loading...</p>
        ) : leaves.length === 0 ? (
          <p className="text-[11px] text-slate-500">No approved leave found.</p>
        ) : (
          <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
            <table className="w-full text-[11px] text-slate-700">
              <thead className="bg-[#f5f6fb] text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Dates</th>
                  <th className="px-3 py-2 text-left font-semibold">Type</th>
                  <th className="px-3 py-2 text-left font-semibold">Days</th>
                  <th className="px-3 py-2 text-left font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => {
                  const typeName =
                    typeof l.type === "string" ? l.type : l.type?.name ?? "";
                  const dateText = `${l.fromDate.slice(0, 10)} - ${l.toDate.slice(0, 10)}`;
                  return (
                    <tr key={l._id} className="border-t border-[#f0f1f7]">
                      <td className="px-3 py-2">{dateText}</td>
                      <td className="px-3 py-2">{typeName}</td>
                      <td className="px-3 py-2">{l.days ?? ""}</td>
                      <td className="px-3 py-2 max-w-xs truncate">
                        {l.reason || "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
