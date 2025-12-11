// frontend/src/pages/admin/job/JobCategoriesPage.tsx
import { FormEvent, useState } from "react";
import {
  useGetJobCategoriesQuery,
  useCreateJobCategoryMutation,
  useUpdateJobCategoryMutation,
  useDeleteJobCategoryMutation,
} from "../../../features/admin/adminApi";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function JobCategoriesPage() {
  const { data: categories, isLoading } = useGetJobCategoriesQuery();
  const [createCategory, { isLoading: isSaving }] =
    useCreateJobCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateJobCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteJobCategoryMutation();

  const [name, setName] = useState("");
  const navigate = useNavigate();

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createCategory({ name: name.trim() }).unwrap();
      setName("");
    } catch (err) {
      console.error("Create failed", err);
      alert("Failed to create job category");
    }
  }

  function startEdit(id: string) {
    const c = categories?.find((x) => x._id === id);
    if (!c) return;
    setEditingId(id);
    setEditName(c.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    try {
      await updateCategory({ id, name: editName.trim() }).unwrap();
      cancelEdit();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update job category");
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Are you sure you want to delete this category?");
    if (!ok) return;
    try {
      await deleteCategory(id).unwrap();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete job category");
    }
  }

  const isBusy = isSaving || isUpdating || isDeleting;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin / Job</h1>
        <p className="text-xs text-slate-500 mt-1">Job Categories</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Job Categories</h2>

          {/* navigate to add route (absolute) */}
          <button
            type="button"
            disabled={isSaving}
            onClick={() => navigate("/admin/job/job-categories/add")}
            className="px-4 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
          >
            + Add
          </button>
        </div>

        <form
          id="job-categories-form"
          onSubmit={handleSubmit}
          className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Job Category *</label>
            <input
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Office & Clerical"
            />
          </div>
        </form>

        <div className="px-6 pb-4">
          <div className="mt-4 border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 w-10">
                    <input type="checkbox" className="accent-green-500" />
                  </th>
                  <th className="text-left px-4 py-2 font-semibold">Job Category</th>
                  <th className="text-right px-4 py-2 font-semibold w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-xs">
                      Loading...
                    </td>
                  </tr>
                ) : !categories || categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-xs text-slate-400">
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => {
                    const isEditing = editingId === c._id;
                    if (isEditing) {
                      return (
                        <tr key={c._id} className="bg-orange-50/40">
                          <td className="px-4 py-2">
                            <input type="checkbox" className="accent-green-500" />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              className="w-full border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-2 text-right space-x-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdate(c._id)}
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

                    return (
                      <tr key={c._id} className="odd:bg-white even:bg-slate-50/50">
                        <td className="px-4 py-2">
                          <input type="checkbox" className="accent-green-500" />
                        </td>
                        <td className="px-4 py-2 text-slate-800">{c.name}</td>
                        <td className="px-4 py-2 text-right space-x-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => startEdit(c._id)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                            title="Edit"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(c._id)}
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
