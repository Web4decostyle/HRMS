import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSkillMutation } from "../../../features/admin/adminApi";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";

export default function AddSkillPage() {
  const navigate = useNavigate();
  const [createSkill, { isLoading: isSaving }] = useCreateSkillMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await createSkill({
      name: name.trim(),
      description: description.trim() || undefined,
    }).unwrap();

    navigate(-1);
  }

  function handleCancel() {
    navigate(-1);
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
            <h1 className="text-lg font-semibold text-slate-900">Add Skill</h1>
            <p className="text-xs text-slate-500">
              Create a new skill for qualification management
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-green-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Skill Details
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-5 sm:px-6">
          <div className="max-w-4xl space-y-6">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Communication, Excel, React"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600">
                Description
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a short description for this skill"
                className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm resize-none outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">
                Use clear skill names so they are easy to assign and search later.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-400">
              <span className="text-rose-500">*</span> Required
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Skill"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}