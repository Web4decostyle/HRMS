import { FormEvent, useState } from "react";
import {
  useGetOrgUnitsQuery,
  useCreateOrgUnitMutation,
} from "../../../features/admin/adminApi";

export default function OrgStructurePage() {
  const { data: units, isLoading } = useGetOrgUnitsQuery();
  const [createUnit, { isLoading: isSaving }] = useCreateOrgUnitMutation();

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await createUnit({
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      description: form.description.trim() || undefined,
    }).unwrap();
    setForm({ name: "", code: "", description: "" });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Admin / Organization
        </h1>
        <p className="text-xs text-slate-500 mt-1">Structure</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">
            Organization Units
          </h2>
          <button
            form="org-structure-form"
            type="submit"
            disabled={isSaving}
            className="px-4 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
          >
            + Add
          </button>
        </div>

        <form
          id="org-structure-form"
          onSubmit={handleSubmit}
          className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Unit Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border border-slate-200 rounded-md px-2 py-1"
              placeholder="e.g. Sales Department"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Code</label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              className="border border-slate-200 rounded-md px-2 py-1"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="border border-slate-200 rounded-md px-2 py-1"
            />
          </div>
        </form>

        <div className="px-6 pb-4">
          <div className="mt-4 border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-2 w-10 text-left">
                    <input type="checkbox" className="accent-red-500" />
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 text-left font-semibold">Code</th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs">
                      Loading...
                    </td>
                  </tr>
                ) : !units || units.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-xs text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  units.map((u) => (
                    <tr
                      key={u._id}
                      className="odd:bg-white even:bg-slate-50/50"
                    >
                      <td className="px-4 py-2">
                        <input type="checkbox" className="accent-red-500" />
                      </td>
                      <td className="px-4 py-2 text-slate-800">{u.name}</td>
                      <td className="px-4 py-2 text-slate-500">
                        {u.code || "-"}
                      </td>
                      <td className="px-4 py-2 text-slate-500">
                        {u.description || "-"}
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
