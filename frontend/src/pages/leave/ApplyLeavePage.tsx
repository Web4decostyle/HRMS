// frontend/src/pages/leave/ApplyLeavePage.tsx
import { useState } from "react";
import {
  useGetLeaveTypesQuery,
  useApplyLeaveMutation,
} from "../../features/leave/leaveApi";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import LeaveModuleTabs from "./LeaveModuleTabs";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";
const textareaCls =
  "w-full min-h-[72px] rounded border border-[#d5d7e5] bg-white px-3 py-2 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";
const selectCls = inputCls;

export default function ApplyLeavePage() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [typeId, setTypeId] = useState("");
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: leaveTypes = [], isLoading: typesLoading } =
    useGetLeaveTypesQuery();
  const [applyLeave, { isLoading: applyLoading }] = useApplyLeaveMutation();

  async function handleApply() {
    setError(null);
    setSuccess(null);

    if (!typeId) {
      setError("Please select a leave type.");
      return;
    }
    if (!fromDate || !toDate) {
      setError("Please select from and to dates.");
      return;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      setError("To Date cannot be before From Date.");
      return;
    }

    try {
      await applyLeave({
        typeId,
        fromDate,
        toDate,
        reason: reason || undefined,
      }).unwrap();
      setSuccess(
        "Leave request submitted. Waiting for supervisor approval. HR/Admin will be notified once it is approved."
      );
      setReason("");
    } catch (e: any) {
      setError(e?.data?.message || "Failed to apply leave.");
    }
  }

  const noLeaveTypes = !typesLoading && leaveTypes.length === 0;

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <main className="flex-1 px-6 py-4 overflow-y-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-slate-800">Leave</h1>
          </div>

          <LeaveModuleTabs activeKey="apply" />

          <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-8">
            <div className="px-7 py-4 border-b border-[#edf0f7]">
              <h2 className="text-[13px] font-semibold text-slate-800">
                Apply Leave
              </h2>
            </div>

            <div className="px-7 pt-5 pb-6 text-[12px] space-y-5">
              {noLeaveTypes ? (
                <p className="text-[12px] text-slate-500">
                  No Leave Types with Leave Balance.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={labelCls}>Leave Type*</label>
                      <select
                        className={selectCls}
                        value={typeId}
                        onChange={(e) => setTypeId(e.target.value)}
                      >
                        <option value="">-- Select --</option>
                        {leaveTypes.map((t: any) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>From Date*</label>
                      <input
                        type="date"
                        className={inputCls}
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>To Date*</label>
                      <input
                        type="date"
                        className={inputCls}
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Comments</label>
                    <textarea
                      className={textareaCls}
                      placeholder="Optional reason for leave"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  {error && <p className="text-[11px] text-rose-600">{error}</p>}
                  {success && (
                    <p className="text-[11px] text-emerald-600">{success}</p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={applyLoading || noLeaveTypes}
                      className="px-6 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
                    >
                      {applyLoading ? "Applying..." : "Apply"}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-1">* Required</p>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
