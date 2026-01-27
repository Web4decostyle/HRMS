import { useState, FormEvent } from "react";
import {
  useGetJobTitlesQuery,
  useCreateJobTitleMutation,
} from "../../../features/admin/adminApi";
import { useNavigate } from "react-router-dom";

export default function JobTitlesPage() {
  const { data: titles, isLoading } = useGetJobTitlesQuery();
  const [createJobTitle, { isLoading: isSaving }] = useCreateJobTitleMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await createJobTitle({
      name: name.trim(),
      code: code.trim() || undefined,
      description: description.trim() || undefined,
    }).unwrap();

    setName("");
    setCode("");
    setDescription("");
  }

  return (
    <div className="space-y-4">
      {/* Header breadcrumb like "Admin / Job" */}
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin / Job</h1>
        <p className="text-xs text-slate-500 mt-1">Job Titles</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Job Titles</h2>
          <button
            form="job-title-form"
            type="submit"
            disabled={isSaving}
            onClick={() => navigate("/admin/job/job-titles/add")}
            className="px-4 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
          >
            + Add
          </button>
        </div>

        
        <form
          id="job-title-form"
          onSubmit={handleSubmit}
          className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Job Title *</label>
            <input
              className="border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales Executive"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Job Code</label>
            <input
              className="border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-400"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="font-medium text-slate-700">
              Job Description
            </label>
            <input
              className="border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </form>

        {/* Table */}
        <div className="px-6 pb-4">
          <div className="mt-4 border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 w-10">
                    <input type="checkbox" className="accent-red-500" />
                  </th>
                  <th className="text-left px-4 py-2 font-semibold">
                    Job Title
                  </th>
                  <th className="text-left px-4 py-2 font-semibold">
                    Job Description
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
                ) : !titles || titles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-xs text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  titles.map((t) => (
                    <tr
                      key={t._id}
                      className="odd:bg-white even:bg-slate-50/50"
                    >
                      <td className="px-4 py-2">
                        <input type="checkbox" className="accent-red-500" />
                      </td>
                      <td className="px-4 py-2 text-slate-800">{t.name}</td>
                      <td className="px-4 py-2 text-slate-500">
                        {t.description || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
