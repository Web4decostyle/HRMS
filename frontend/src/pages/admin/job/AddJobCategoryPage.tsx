import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateJobCategoryMutation } from "../../../features/admin/adminApi";
import { BriefcaseBusiness, Plus, ArrowLeft } from "lucide-react";

export default function AddJobCategoryPage() {
  const navigate = useNavigate();
  const [createJobCategory, { isLoading }] = useCreateJobCategoryMutation();

  const [name, setName] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createJobCategory({ name: name.trim() }).unwrap();
      navigate("/admin/job/job-categories");
    } catch (err) {
      console.error("create job category failed", err);
      alert("Failed to create job category");
    }
  }

  return (
    <div className="space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
            <BriefcaseBusiness className="h-5 w-5 text-green-600" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Add Job Category
            </h1>
            <p className="text-xs text-slate-500">
              Create a new job category for your organization
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/job/job-categories")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </button>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-green-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Job Category Details
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-5 sm:px-6">
          <div className="max-w-3xl">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Technical, Management"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
              />
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              Add a clear and meaningful category name that can be reused across job setup.
            </p>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-400">
              <span className="text-rose-500">*</span> Required
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/admin/job/job-categories")}
                className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {isLoading ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}