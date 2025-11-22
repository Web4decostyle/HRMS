import { FormEvent, useState } from "react";
import {
  useGetPayGradesQuery,
  useCreatePayGradeMutation,
} from "../../../features/admin/adminApi";

export default function PayGradesPage() {
  const { data: grades, isLoading } = useGetPayGradesQuery();
  const [createPayGrade, { isLoading: isSaving }] = useCreatePayGradeMutation();

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await createPayGrade({
      name: name.trim(),
      currency: currency.trim() || undefined,
      minSalary: minSalary ? Number(minSalary) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
    }).unwrap();

    setName("");
    setMinSalary("");
    setMaxSalary("");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin / Job</h1>
        <p className="text-xs text-slate-500 mt-1">Pay Grades</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Pay Grades</h2>
          <button
            form="pay-grade-form"
            type="submit"
            disabled={isSaving}
            className="px-4 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
          >
            + Add
          </button>
        </div>

        <form
          id="pay-grade-form"
          onSubmit={handleSubmit}
          className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs"
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Name *</label>
            <input
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-orange-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grade A"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Currency</label>
            <input
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-orange-400 focus:outline-none"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">
              Min Salary (optional)
            </label>
            <input
              type="number"
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-orange-400 focus:outline-none"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">
              Max Salary (optional)
            </label>
            <input
              type="number"
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-orange-400 focus:outline-none"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
            />
          </div>
        </form>

        <div className="px-6 pb-4">
          <div className="mt-4 border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 w-10">
                    <input type="checkbox" className="accent-orange-500" />
                  </th>
                  <th className="text-left px-4 py-2 font-semibold">Name</th>
                  <th className="text-left px-4 py-2 font-semibold">Currency</th>
                  <th className="text-left px-4 py-2 font-semibold">
                    Salary Range
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs">
                      Loading...
                    </td>
                  </tr>
                ) : !grades || grades.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-xs text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  grades.map((g) => (
                    <tr
                      key={g._id}
                      className="odd:bg-white even:bg-slate-50/50"
                    >
                      <td className="px-4 py-2">
                        <input type="checkbox" className="accent-orange-500" />
                      </td>
                      <td className="px-4 py-2 text-slate-800">{g.name}</td>
                      <td className="px-4 py-2 text-slate-500">
                        {g.currency || "-"}
                      </td>
                      <td className="px-4 py-2 text-slate-500">
                        {g.minSalary || g.maxSalary
                          ? `${g.minSalary ?? "—"} - ${g.maxSalary ?? "—"}`
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
