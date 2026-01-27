// frontend/src/pages/admin/qualifications/AddSkillPage.tsx
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSkillMutation } from "../../../features/admin/adminApi";

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

    // after save, go back to previous page (usually Skills list)
    navigate(-1);
  }

  function handleCancel() {
    navigate(-1); // back to Skills list (or previous page)
  }

  return (
    <div className="p-6">
      
      <h2 className="text-sm font-semibold text-gray-600 mb-3">Admin</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-6 max-w-5xl mx-auto">
        <h3 className="text-base font-semibold text-slate-800 mb-6">
          Add Skill
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Name<span className="text-green-500 ml-0.5">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Type description here"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              <span className="text-green-500 mr-0.5">*</span>Required
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-1.5 rounded-full border border-lime-500 text-lime-600 text-sm font-semibold bg-white hover:bg-lime-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
