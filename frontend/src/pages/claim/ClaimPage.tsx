// frontend/src/pages/claim/ClaimPage.tsx
import { FormEvent, useState } from "react";
import {
  useGetClaimTypesQuery,
  useSubmitClaimMutation,
  useGetMyClaimsQuery,
} from "../../features/claim/claimApi";

export default function ClaimPage() {
  const { data: types } = useGetClaimTypesQuery();
  const { data: claims } = useGetMyClaimsQuery();
  const [submitClaim] = useSubmitClaimMutation();

  const [typeId, setTypeId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!typeId || !amount || !date) return;

    await submitClaim({
      typeId,
      amount: Number(amount),
      claimDate: date,
      description,
    }).unwrap();

    setAmount("");
    setDescription("");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">
        Claims · Expense Reimbursement
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Submit Claim
          </h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-2 text-xs"
          >
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-500">
                Claim Type
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
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <label className="block text-[11px] text-slate-500">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-2 py-1"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-[11px] text-slate-500">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-2 py-1"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-500">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-2 py-1"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="mt-1 px-3 py-1.5 rounded-md bg-orange-500 text-white hover:bg-orange-600"
            >
              Submit
            </button>
          </form>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            My Claims
          </h2>
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 border-b">
              <tr>
                <th className="py-1">Date</th>
                <th className="py-1">Type</th>
                <th className="py-1">Amount</th>
                <th className="py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {claims?.map((c) => (
                <tr key={c._id} className="border-b last:border-0">
                  <td className="py-1">{c.claimDate.slice(0, 10)}</td>
                  <td className="py-1">
                    {typeof c.type === "string" ? c.type : c.type?.name}
                  </td>
                  <td className="py-1">
                    {c.currency} {c.amount}
                  </td>
                  <td className="py-1 text-[11px]">{c.status}</td>
                </tr>
              ))}
              {!claims?.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-3 text-center text-slate-400 text-xs"
                  >
                    No claims yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
