// frontend/src/pages/leave/LeavePage.tsx
import { FormEvent, useState } from "react";
import {
  useGetLeaveTypesQuery,
  useApplyLeaveMutation,
  useGetMyLeavesQuery,
} from "../../features/leave/leaveApi";

export default function LeavePage() {
  const { data: types } = useGetLeaveTypesQuery();
  const { data: leaves } = useGetMyLeavesQuery();
  const [applyLeave, { isLoading: applying }] = useApplyLeaveMutation();

  const [typeId, setTypeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!typeId || !fromDate || !toDate) return;

    await applyLeave({ typeId, fromDate, toDate, reason }).unwrap();

    // reset form
    setTypeId("");
    setFromDate("");
    setToDate("");
    setReason("");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">
        Leave · Apply & My Requests
      </h1>

      {/* Apply Leave */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">
          Apply Leave
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 md:grid-cols-2 text-xs"
        >
          <div className="space-y-1 md:col-span-1">
            <label className="block text-[11px] text-slate-500">
              Leave Type
            </label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-2 py-1"
            >
              <option value="">Select</option>
              {types?.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 md:col-span-1 flex gap-2">
            <div className="flex-1">
              <label className="block text-[11px] text-slate-500">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-2 py-1"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] text-slate-500">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-2 py-1"
              />
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-[11px] text-slate-500">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-200 px-2 py-1"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={applying}
              className="px-4 py-1.5 rounded-md bg-green-500 text-white text-xs hover:bg-green-600 disabled:opacity-50"
            >
              {applying ? "Submitting..." : "Apply Leave"}
            </button>
          </div>
        </form>
      </section>

      {/* My Leaves table */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">
          My Leave Requests
        </h2>

        <table className="w-full text-xs text-left">
          <thead className="text-[11px] text-slate-500 border-b">
            <tr>
              <th className="py-1">Period</th>
              <th className="py-1">Type</th>
              <th className="py-1 text-center">Days</th>
              <th className="py-1">Status</th>
              <th className="py-1">Reason</th>
            </tr>
          </thead>
          <tbody>
            {leaves?.map((l) => {
              const typeName =
                typeof l.type === "string"
                  ? l.type
                  : (l.type?.name ?? "—");

              const period = `${l.fromDate.slice(0, 10)} → ${l.toDate.slice(
                0,
                10
              )}`;

              return (
                <tr key={l._id} className="border-b last:border-0">
                  <td className="py-1">{period}</td>
                  <td className="py-1">{typeName}</td>
                  <td className="py-1 text-center">{l.days ?? ""}</td>
                  <td className="py-1">
                    <span
                      className={[
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px]",
                        l.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700"
                          : l.status === "REJECTED"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-slate-100 text-slate-700",
                      ].join(" ")}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="py-1 max-w-xs truncate" title={l.reason}>
                    {l.reason || "—"}
                  </td>
                </tr>
              );
            })}

            {!leaves?.length && (
              <tr>
                <td
                  colSpan={5}
                  className="py-3 text-center text-slate-400 text-xs"
                >
                  No leave requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
