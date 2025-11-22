import { FormEvent, useState } from "react";
import {
  useGetJobCategoriesQuery,
  useCreateJobCategoryMutation,
} from "../../../features/admin/adminApi";

export default function JobCategoriesPage() {
  const { data: categories, isLoading } = useGetJobCategoriesQuery();
  const [createCategory, { isLoading: isSaving }] =
    useCreateJobCategoryMutation();

  const [name, setName] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await createCategory({ name: name.trim() }).unwrap();
    setName("");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin / Job</h1>
        <p className="text-xs text-slate-500 mt-1">Job Categories</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">
            Job Categories
          </h2>
          <button
            form="job-categories-form"
            type="submit"
            disabled={isSaving}
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
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-orange-400 focus:outline-none"
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
                    <input type="checkbox" className="accent-orange-500" />
                  </th>
                  <th className="text-left px-4 py-2 font-semibold">
                    Job Category
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-xs">
                      Loading...
                    </td>
                  </tr>
                ) : !categories || categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-6 text-center text-xs text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr
                      key={c._id}
                      className="odd:bg-white even:bg-slate-50/50"
                    >
                      <td className="px-4 py-2">
                        <input type="checkbox" className="accent-orange-500" />
                      </td>
                      <td className="px-4 py-2 text-slate-800">{c.name}</td>
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
