// frontend/src/pages/admin/job/PayGradesPage.tsx
import { FormEvent, useState } from "react";
import {
  useGetPayGradesQuery,
  useCreatePayGradeMutation,
  useUpdatePayGradeMutation,
  useDeletePayGradeMutation,
} from "../../../features/admin/adminApi";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function PayGradesPage() {
  const { data: grades, isLoading } = useGetPayGradesQuery();

  const [createPayGrade, { isLoading: isSaving }] =
    useCreatePayGradeMutation();
  const [updatePayGrade, { isLoading: isUpdating }] =
    useUpdatePayGradeMutation();
  const [deletePayGrade, { isLoading: isDeleting }] =
    useDeletePayGradeMutation();

  // Add form state
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");

  // Edit row state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCurrency, setEditCurrency] = useState("INR");
  const [editMinSalary, setEditMinSalary] = useState("");
  const [editMaxSalary, setEditMaxSalary] = useState("");

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

  function startEdit(id: string) {
    const g = grades?.find((x) => x._id === id);
    if (!g) return;

    setEditingId(id);
    setEditName(g.name);
    setEditCurrency(g.currency || "INR");
    setEditMinSalary(
      typeof g.minSalary === "number" ? String(g.minSalary) : ""
    );
    setEditMaxSalary(
      typeof g.maxSalary === "number" ? String(g.maxSalary) : ""
    );
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditCurrency("INR");
    setEditMinSalary("");
    setEditMaxSalary("");
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;

    await updatePayGrade({
      id,
      name: editName.trim(),
      currency: editCurrency.trim() || undefined,
      minSalary: editMinSalary ? Number(editMinSalary) : undefined,
      maxSalary: editMaxSalary ? Number(editMaxSalary) : undefined,
    }).unwrap();

    cancelEdit();
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Are you sure you want to delete this pay grade?");
    if (!ok) return;
    await deletePayGrade(id).unwrap();
  }

  const isBusy = isSaving || isUpdating || isDeleting;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin / Job</h1>
        <p className="text-xs text-slate-500 mt-1">Pay Grades</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header bar */}
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

        {/* Inline Add form */}
        <form
          id="pay-grade-form"
          onSubmit={handleSubmit}
          className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs"
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Name *</label>
            <input
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grade A"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Currency</label>
            <input
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none"
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
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none"
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
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
            />
          </div>
        </form>

        {/* Table */}
        <div className="px-6 pb-4">
          <div className="mt-4 border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 w-10">
                    <input type="checkbox" className="accent-green-500" />
                  </th>
                  <th className="text-left px-4 py-2 font-semibold">Name</th>
                  <th className="text-left px-4 py-2 font-semibold">
                    Currency
                  </th>
                  <th className="text-left px-4 py-2 font-semibold">
                    Salary Range
                  </th>
                  <th className="text-right px-4 py-2 font-semibold w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs">
                      Loading...
                    </td>
                  </tr>
                ) : !grades || grades.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-xs text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  grades.map((g) => {
                    const isEditing = editingId === g._id;

                    if (isEditing) {
                      // Editable row
                      return (
                        <tr key={g._id} className="bg-green-50/40">
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              className="accent-green-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              className="w-full border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              className="w-full border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none"
                              value={editCurrency}
                              onChange={(e) =>
                                setEditCurrency(e.target.value)
                              }
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex gap-2">
                              <input
                                type="number"
                                className="w-1/2 border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none"
                                placeholder="Min"
                                value={editMinSalary}
                                onChange={(e) =>
                                  setEditMinSalary(e.target.value)
                                }
                              />
                              <input
                                type="number"
                                className="w-1/2 border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none"
                                placeholder="Max"
                                value={editMaxSalary}
                                onChange={(e) =>
                                  setEditMaxSalary(e.target.value)
                                }
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right space-x-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdate(g._id)}
                              className="inline-flex items-center px-3 py-1 rounded-full bg-lime-500 text-white text-[11px] font-semibold disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={cancelEdit}
                              className="inline-flex items-center px-3 py-1 rounded-full border border-slate-300 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    // Normal (view) row
                    return (
                      <tr
                        key={g._id}
                        className="odd:bg-white even:bg-slate-50/50"
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            className="accent-green-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-slate-800">{g.name}</td>
                        <td className="px-4 py-2 text-slate-500">
                          {g.currency || "-"}
                        </td>
                        <td className="px-4 py-2 text-slate-500">
                          {g.minSalary || g.maxSalary
                            ? `${g.minSalary ?? "—"} - ${
                                g.maxSalary ?? "—"
                              }`
                            : "-"}
                        </td>
                        <td className="px-4 py-2 text-right space-x-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => startEdit(g._id)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                            title="Edit"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(g._id)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-60"
                            title="Delete"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
