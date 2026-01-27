import { FormEvent, useState } from "react";
import {
  useGetEmploymentStatusesQuery,
  useCreateEmploymentStatusMutation,
  useUpdateEmploymentStatusMutation,
  useDeleteEmploymentStatusMutation,
} from "../../../features/admin/adminApi";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function EmploymentStatusPage() {
  const { data: statuses, isLoading } = useGetEmploymentStatusesQuery();
  const [createStatus, { isLoading: isSaving }] =
    useCreateEmploymentStatusMutation();
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateEmploymentStatusMutation();
  const [deleteStatus, { isLoading: isDeleting }] =
    useDeleteEmploymentStatusMutation();

  const [name, setName] = useState("");
  const navigate = useNavigate();

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createStatus({ name: name.trim() }).unwrap();
      setName("");
    } catch (err) {
      console.error("Create failed", err);
      alert("Failed to create employment status");
    }
  }

  function startEdit(id: string) {
    const s = statuses?.find((x) => x._id === id);
    if (!s) return;
    setEditingId(id);
    setEditName(s.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    try {
      await updateStatus({ id, name: editName.trim() }).unwrap();
      cancelEdit();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update employment status");
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Are you sure you want to delete this status?");
    if (!ok) return;
    try {
      await deleteStatus(id).unwrap();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete employment status");
    }
  }

  const isBusy = isSaving || isUpdating || isDeleting;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin / Job</h1>
        <p className="text-xs text-slate-500 mt-1">Employment Status</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">
            Employment Status
          </h2>
          <button
            form="employment-status-form"
            type="submit"
            disabled={isSaving}
            onClick={() => navigate("/admin/job/employment-status/add")}
            className="px-4 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
          >
            + Add
          </button>
        </div>

        <form
          id="employment-status-form"
          onSubmit={handleSubmit}
          className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">
              Employment Status *
            </label>
            <input
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Full-Time Permanent"
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
                  <th className="text-left px-4 py-2 font-semibold">
                    Employment Status
                  </th>
                  <th className="text-right px-4 py-2 font-semibold w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-xs">
                      Loading...
                    </td>
                  </tr>
                ) : !statuses || statuses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-xs text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  statuses.map((s) => {
                    const isEditing = editingId === s._id;
                    if (isEditing) {
                      return (
                        <tr key={s._id} className="bg-green-50/40">
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
                          <td className="px-4 py-2 text-right space-x-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdate(s._id)}
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
                      <tr
                        key={s._id}
                        className="odd:bg-white even:bg-slate-50/50"
                      >
                        <td className="px-4 py-2">
                          <input type="checkbox" className="accent-green-500" />
                        </td>
                        <td className="px-4 py-2 text-slate-800">{s.name}</td>
                        <td className="px-4 py-2 text-right space-x-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => startEdit(s._id)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                            title="Edit"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(s._id)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-green-200 text-green-500 hover:bg-green-50 disabled:opacity-60"
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
