import React, { FormEvent, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetJobTitlesQuery,
  useUpdateJobTitleMutation,
} from "../../../features/admin/adminApi";

export default function EditJobTitlePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: titles, isLoading, isFetching } = useGetJobTitlesQuery();
  const job = useMemo(
    () => (titles ?? []).find((t) => t._id === id),
    [titles, id]
  );

  const [updateJobTitle, { isLoading: isSaving }] = useUpdateJobTitleMutation();

  const [name, setName] = useState(job?.name ?? "");
  const [description, setDescription] = useState(job?.description ?? "");
  const [note, setNote] = useState((job as any)?.note ?? "");
  const [specFile, setSpecFile] = useState<File | null>(null);

  // once job loads (first time), hydrate form
  React.useEffect(() => {
    if (!job) return;
    setName(job.name ?? "");
    setDescription(job.description ?? "");
    setNote((job as any)?.note ?? "");
  }, [job]);

  const busy = isLoading || isFetching;

  function onPickFile(file?: File | null) {
    if (!file) {
      setSpecFile(null);
      return;
    }
    // 1MB max like screenshot text
    const max = 1 * 1024 * 1024;
    if (file.size > max) {
      alert("File too large. Max allowed is 1MB.");
      return;
    }
    setSpecFile(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!name.trim()) {
      alert("Job Title is required.");
      return;
    }

    try {
      // If file exists -> send FormData (commonly used for uploads)
      if (specFile) {
        const fd = new FormData();
        fd.append("name", name.trim());
        fd.append("description", description.trim());
        fd.append("note", note.trim());
        fd.append("spec", specFile); // backend field name may differ

        await updateJobTitle({ id, body: fd } as any).unwrap();
      } else {
        await updateJobTitle({
          id,
          name: name.trim(),
          description: description.trim() || undefined,
          note: note.trim() || undefined,
        } as any).unwrap();
      }

      navigate("/admin/job/job-titles");
    } catch (err) {
      alert("Failed to update Job Title.");
    }
  }

  if (busy) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="text-sm text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="text-sm text-slate-700 font-semibold">
          Job Title not found
        </div>
        <button
          className="mt-4 inline-flex items-center px-4 h-9 rounded-full border border-slate-200 text-xs font-semibold hover:bg-slate-50"
          onClick={() => navigate("/admin/job/job-titles")}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* top breadcrumb line like screenshot */}
      <div className="px-1">
        <div className="text-lg font-semibold text-slate-900">Admin</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* header */}
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Edit Job Title</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="space-y-5">
            {/* Job Title */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-2">
                Job Title<span className="text-rose-500">*</span>
              </label>
              <input
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-[13px] text-slate-800 outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sales Executive"
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-2">
                Job Description
              </label>
              <textarea
                className="w-full min-h-[110px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-800 outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write description..."
              />
            </div>

            {/* Job Specification (file) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-2">
                Job Specification
              </label>

              <div className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center justify-center px-4 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer">
                    Browse
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => onPickFile(e.target.files?.[0])}
                    />
                  </label>

                  <div className="text-xs text-slate-500">
                    {specFile ? specFile.name : "No file selected"}
                  </div>
                </div>

                {/* small upload icon feel */}
                <div className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                  ⬆
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-400">
                Accepts up to 1MB
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-2">
                <span className="inline-flex items-center gap-2">
                  ✎ Note
                </span>
              </label>
              <textarea
                className="w-full min-h-[110px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-800 outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write note..."
              />
            </div>

            {/* footer actions like screenshot */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                <span className="text-rose-500">*</span> Required
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/job/job-titles")}
                  className="px-8 h-10 rounded-full border border-lime-500 text-lime-600 text-xs font-semibold hover:bg-lime-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-10 h-10 rounded-full bg-lime-600 hover:bg-lime-700 text-white text-xs font-semibold disabled:opacity-60"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
