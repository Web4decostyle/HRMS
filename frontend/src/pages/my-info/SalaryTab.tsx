import { useState } from "react";
import {
  useGetSalaryQuery,
  useCreateSalaryMutation,
  useDeleteSalaryMutation,
} from "../../features/myInfo/myInfoApi";

const labelCls = "block text-[11px] font-semibold text-slate-500 mb-1";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";

export default function SalaryTab({ employeeId }: { employeeId: string }) {
  const { data: salary = [], isLoading } = useGetSalaryQuery(employeeId);
  const [createSalary, { isLoading: creating }] = useCreateSalaryMutation();
  const [deleteSalary, { isLoading: deleting }] = useDeleteSalaryMutation();

  const [form, setForm] = useState({
    componentName: "",
    amount: "",
    currency: "INR",
    payFrequency: "Monthly",
    directDepositAmount: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.componentName || !form.amount) {
      alert("Please fill required fields.");
      return;
    }

    await createSalary({
      employeeId,
      data: {
        componentName: form.componentName,
        amount: Number(form.amount),
        currency: form.currency,
        payFrequency: form.payFrequency,
        directDepositAmount: form.directDepositAmount
          ? Number(form.directDepositAmount)
          : undefined,
      },
    });

    setForm({
      componentName: "",
      amount: "",
      currency: "INR",
      payFrequency: "Monthly",
      directDepositAmount: "",
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete Salary Component?")) return;

    await deleteSalary({ employeeId, salaryId: id });
  }

  return (
    <>
      {/* Header */}
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Assigned Salary Components
        </h2>
      </div>

      <div className="px-7 pt-5 pb-4">

        {/* Add New Salary Component */}
        <form
          onSubmit={handleSubmit}
          className="border border-[#e5e7f0] rounded-lg p-5 mb-6 space-y-4"
        >
          <h3 className="text-[12px] font-semibold text-slate-700 mb-3">
            Add Salary Component
          </h3>

          {/* Component Name + Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Component Name*</label>
              <input
                name="componentName"
                value={form.componentName}
                onChange={handleChange}
                className={inputCls}
                placeholder="Basic Salary"
              />
            </div>

            <div>
              <label className={labelCls}>Amount*</label>
              <input
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className={inputCls}
                type="number"
                placeholder="0"
              />
            </div>
          </div>

          {/* Currency + Pay Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Currency</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Pay Frequency</label>
              <select
                name="payFrequency"
                value={form.payFrequency}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>
          </div>

          {/* Direct Deposit Amount */}
          <div>
            <label className={labelCls}>Direct Deposit Amount</label>
            <input
              name="directDepositAmount"
              value={form.directDepositAmount}
              onChange={handleChange}
              className={inputCls}
              type="number"
              placeholder="Optional"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={creating}
              className="px-6 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
            >
              {creating ? "Saving..." : "Add"}
            </button>
          </div>
        </form>

        {/* Salary Components Table */}
        <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
          <table className="w-full text-[11px]">
            <thead className="bg-[#f5f6fb] text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Component</th>
                <th className="px-3 py-2 text-left font-semibold">Amount</th>
                <th className="px-3 py-2 text-left font-semibold">Currency</th>
                <th className="px-3 py-2 text-left font-semibold">Frequency</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Direct Deposit
                </th>
                <th className="px-3 py-2 text-center font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : salary.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    No Records Found
                  </td>
                </tr>
              ) : (
                salary.map((row: any) => (
                  <tr key={row._id} className="border-t border-[#f0f1f7]">
                    <td className="px-3 py-2">{row.componentName}</td>
                    <td className="px-3 py-2">{row.amount}</td>
                    <td className="px-3 py-2">{row.currency}</td>
                    <td className="px-3 py-2">{row.payFrequency}</td>
                    <td className="px-3 py-2">
                      {row.directDepositAmount || "--"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleDelete(row._id)}
                        disabled={deleting}
                        className="text-[11px] text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
