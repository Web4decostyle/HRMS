import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateEmploymentStatusMutation,
} from "../../../features/admin/adminApi";

export default function AddEmploymentStatusPage() {
  const navigate = useNavigate();
  const [createEmploymentStatus, { isLoading }] = useCreateEmploymentStatusMutation();

  const [name, setName] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createEmploymentStatus({ name: name.trim() }).unwrap();
      // go back to listing page (adjust route if different)
      navigate("/admin/job/employment-status");
    } catch (err) {
      // keep simple: show alert (you can replace with nicer UI later)
      console.error("create error", err);
      alert("Failed to create employment status. See console for details.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb header */}
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin / Job</h1>
        <p className="text-xs text-slate-500 mt-1">Add Employment Status</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">
          Add Employment Status
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="space-y-1 max-w-2xl">
            <label className="block text-slate-700 font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
              placeholder="e.g. Full Time, Part Time, Contract"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/job/employment-status")}
              className="px-6 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              onClick={() => navigate("/admin/job/employment-status/add")}
              className="px-8 py-2 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
            >
              Save
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            <span className="text-red-500">*</span> Required
          </p>
        </form>
      </div>
    </div>
  );
}
