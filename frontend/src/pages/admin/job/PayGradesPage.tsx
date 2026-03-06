// frontend/src/pages/admin/job/PayGradesPage.tsx
import { FormEvent, useState } from "react";
import {
  useGetPayGradesQuery,
  useCreatePayGradeMutation,
  useUpdatePayGradeMutation,
  useDeletePayGradeMutation,
} from "../../../features/admin/adminApi";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Plus, Wallet, PencilLine, BadgeIndianRupee } from "lucide-react";

export default function PayGradesPage() {
  const { data: grades, isLoading } = useGetPayGradesQuery();

  const [createPayGrade, { isLoading: isSaving }] =
    useCreatePayGradeMutation();
  const [updatePayGrade, { isLoading: isUpdating }] =
    useUpdatePayGradeMutation();
  const [deletePayGrade, { isLoading: isDeleting }] =
    useDeletePayGradeMutation();

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCurrency, setEditCurrency] = useState("INR");
  const [editMinSalary, setEditMinSalary] = useState("");
  const [editMaxSalary, setEditMaxSalary] = useState("");

  const isBusy = isSaving || isUpdating || isDeleting;

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
    setCurrency("INR");
    setMinSalary("");
    setMaxSalary("");
  }

  function startEdit(id: string) {
    const g = grades?.find((x) => x._id === id);
    if (!g) return;

    setEditingId(id);
    setEditName(g.name);
    setEditCurrency(g.currency || "INR");
    setEditMinSalary(typeof g.minSalary === "number" ? String(g.minSalary) : "");
    setEditMaxSalary(typeof g.maxSalary === "number" ? String(g.maxSalary) : "");
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

  return (
    <div className="space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
            <Wallet className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Pay Grades</h1>
            <p className="text-xs text-slate-500">
              Create and manage pay grade salary ranges
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          {grades?.length ?? 0} Records
        </div>
      </div>

      {/* Add Form */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-green-600" />
            <h2 className="text-sm font-semibold text-slate-900">Add Pay Grade</h2>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 px-4 py-5 sm:px-6 md:grid-cols-2 xl:grid-cols-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grade A"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Currency</label>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Min Salary</label>
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Max Salary</label>
            <input
              type="number"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-4 flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {isSaving ? "Adding..." : "Add Pay Grade"}
            </button>
          </div>
        </form>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-900">Pay Grade List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Currency
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Salary Range
                </th>
                <th className="w-[160px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : !grades || grades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                    No Records Found
                  </td>
                </tr>
              ) : (
                grades.map((g) => {
                  const isEditing = editingId === g._id;

                  if (isEditing) {
                    return (
                      <tr key={g._id} className="bg-green-50/50">
                        <td className="px-4 py-3 align-top">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                          />
                        </td>

                        <td className="px-4 py-3 align-top">
                          <input
                            value={editCurrency}
                            onChange={(e) => setEditCurrency(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                          />
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={editMinSalary}
                              onChange={(e) => setEditMinSalary(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={editMaxSalary}
                              onChange={(e) => setEditMaxSalary(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                            />
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdate(g._id)}
                              className="rounded-full bg-green-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={cancelEdit}
                              className="rounded-full border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={g._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{g.name}</div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          <BadgeIndianRupee className="h-3.5 w-3.5" />
                          {g.currency || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {g.minSalary || g.maxSalary
                          ? `${g.minSalary ?? "—"} - ${g.maxSalary ?? "—"}`
                          : "-"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => startEdit(g._id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                            title="Edit"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(g._id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
                            title="Delete"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Pay Grade List</h2>
        </div>

        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading...</div>
          ) : !grades || grades.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No Records Found
            </div>
          ) : (
            grades.map((g) => {
              const isEditing = editingId === g._id;

              if (isEditing) {
                return (
                  <div
                    key={g._id}
                    className="rounded-2xl border border-green-200 bg-green-50/40 p-4 space-y-3"
                  >
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Name
                      </label>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Currency
                      </label>
                      <input
                        value={editCurrency}
                        onChange={(e) => setEditCurrency(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Min
                        </label>
                        <input
                          type="number"
                          value={editMinSalary}
                          onChange={(e) => setEditMinSalary(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Max
                        </label>
                        <input
                          type="number"
                          value={editMaxSalary}
                          onChange={(e) => setEditMaxSalary(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUpdate(g._id)}
                        className="flex-1 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={cancelEdit}
                        className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={g._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {g.name}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        <BadgeIndianRupee className="h-3.5 w-3.5" />
                        {g.currency || "-"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => startEdit(g._id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        title="Edit"
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDelete(g._id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-60"
                        title="Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-600">
                    Salary Range:{" "}
                    <span className="font-medium text-slate-800">
                      {g.minSalary || g.maxSalary
                        ? `${g.minSalary ?? "—"} - ${g.maxSalary ?? "—"}`
                        : "-"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}