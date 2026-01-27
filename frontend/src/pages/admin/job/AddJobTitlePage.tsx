import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateJobTitleMutation } from "../../../features/admin/adminApi";

export default function AddJobTitlePage() {
  const navigate = useNavigate();
  const [createJobTitle, { isLoading }] = useCreateJobTitleMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [specFileName, setSpecFileName] = useState<string>("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    // For now backend supports: { name, code?, description? }
    // We merge note into the description field.
    let finalDescription = description.trim();
    if (note.trim()) {
      finalDescription = finalDescription
        ? `${finalDescription}\n\nNote: ${note.trim()}`
        : `Note: ${note.trim()}`;
    }

    await createJobTitle({
      name: name.trim(),
      description: finalDescription || undefined,
      // code can be added later if you add a field in the UI
    }).unwrap();

    navigate("/admin/job/job-titles");
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb header */}
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin / Job</h1>
        <p className="text-xs text-slate-500 mt-1">Add Job Title</p>
      </div>

      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">
          Add Job Title
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Job Title */}
          <div className="space-y-1">
            <label className="block text-slate-700 font-medium">
              Job Title <span className="text-green-500">*</span>
            </label>
            <input
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
              placeholder="Type job title here"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Job Description */}
          <div className="space-y-1">
            <label className="block text-slate-700 font-medium">
              Job Description
            </label>
            <textarea
              className="w-full min-h-[80px] border border-slate-200 rounded-md px-3 py-2 text-xs resize-y focus:outline-none focus:ring-1 focus:ring-green-400"
              placeholder="Type description here"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Job Specification – UI only for now (not sent to backend) */}
          <div className="space-y-1">
            <label className="block text-slate-700 font-medium">
              Job Specification
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md text-xs cursor-pointer hover:bg-slate-50">
                Browse
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setSpecFileName(file ? file.name : "");
                  }}
                />
              </label>
              <span className="text-[11px] text-slate-500 truncate max-w-xs">
                {specFileName || "No file chosen"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Accepts up to 1MB
            </p>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="block text-slate-700 font-medium">Note</label>
            <textarea
              className="w-full min-h-[80px] border border-slate-200 rounded-md px-3 py-2 text-xs resize-y focus:outline-none focus:ring-1 focus:ring-green-400"
              placeholder="Add note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/job/job-titles")}
              className="px-6 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
            >
              Save
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mt-2">
            <span className="text-green-500">*</span> Required
          </p>
        </form>
      </div>
    </div>
  );
}
