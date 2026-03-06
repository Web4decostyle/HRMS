import { FormEvent, useState } from "react";
import {
  useGetSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} from "../../../features/admin/adminApi";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, PencilLine, Trash2 } from "lucide-react";

export default function SkillsPage() {
  const { data: skills, isLoading } = useGetSkillsQuery();

  const [createSkill, { isLoading: isSaving }] = useCreateSkillMutation();
  const [updateSkill, { isLoading: isUpdating }] = useUpdateSkillMutation();
  const [deleteSkill, { isLoading: isDeleting }] = useDeleteSkillMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const navigate = useNavigate();
  const isBusy = isSaving || isUpdating || isDeleting;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await createSkill({
      name: name.trim(),
      description: description.trim() || undefined,
    }).unwrap();

    setName("");
    setDescription("");
  }

  function startEdit(skill: any) {
    setEditingId(skill._id);
    setEditName(skill.name || "");
    setEditDescription(skill.description || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;

    await updateSkill({
      id,
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    }).unwrap();

    cancelEdit();
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Are you sure you want to delete this skill?");
    if (!ok) return;

    await deleteSkill(id).unwrap();
  }

  return (
    <div className="space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
            <Sparkles className="h-5 w-5 text-green-600" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-slate-900">Skills</h1>
            <p className="text-xs text-slate-500">
              Manage qualification skills for employees and roles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            {skills?.length ?? 0} Records
          </div>
{/* 
          <button
            type="button"
            onClick={() => navigate("/admin/qualifications/skills/add")}
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            <Plus className="h-4 w-4" />
            Add Skill
          </button> */}
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-green-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Quick Add Skill
            </h2>
          </div>
        </div>

        <form
          id="skills-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 px-4 py-5 sm:px-6 md:grid-cols-2"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Skill Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Communication, Excel, React"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional short description"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Skill"}
            </button>
          </div>
        </form>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-900">Skills List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 w-12 text-left">
                  <input type="checkbox" className="accent-green-500" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Skill
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Description
                </th>
                <th className="w-[160px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : !skills || skills.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    No Records Found
                  </td>
                </tr>
              ) : (
                skills.map((s: any) => {
                  const isEditing = editingId === s._id;

                  if (isEditing) {
                    return (
                      <tr key={s._id} className="bg-green-50/40">
                        <td className="px-4 py-4">
                          <input type="checkbox" className="accent-green-500" />
                        </td>

                        <td className="px-4 py-4 align-top">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                          />
                        </td>

                        <td className="px-4 py-4 align-top">
                          <input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdate(s._id)}
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
                    <tr key={s._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-4">
                        <input type="checkbox" className="accent-green-500" />
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">
                          {s.name}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {s.description || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => startEdit(s)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                            title="Edit"
                          >
                            <PencilLine className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(s._id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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
          <h2 className="text-sm font-semibold text-slate-900">Skills List</h2>
        </div>

        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Loading...
            </div>
          ) : !skills || skills.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No Records Found
            </div>
          ) : (
            skills.map((s: any) => {
              const isEditing = editingId === s._id;

              if (isEditing) {
                return (
                  <div
                    key={s._id}
                    className="rounded-2xl border border-green-200 bg-green-50/40 p-4 space-y-3"
                  >
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Skill Name
                      </label>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Description
                      </label>
                      <input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUpdate(s._id)}
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
                  key={s._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {s.name}
                      </div>

                      <div className="mt-2 text-sm text-slate-600">
                        {s.description || "-"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => startEdit(s)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        title="Edit"
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDelete(s._id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-60"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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