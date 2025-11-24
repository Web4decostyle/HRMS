import { FormEvent, useState } from "react";
import {
  useGetLocationsQuery,
  useCreateLocationMutation,
} from "../../../features/admin/adminApi";

export default function LocationsPage() {
  const { data: locations, isLoading } = useGetLocationsQuery();
  const [createLocation, { isLoading: isSaving }] =
    useCreateLocationMutation();

  const [form, setForm] = useState({
    name: "",
    city: "",
    country: "",
    address: "",
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
    await createLocation(form).unwrap();
    setForm({ name: "", city: "", country: "", address: "" });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Admin / Organization
        </h1>
        <p className="text-xs text-slate-500 mt-1">Locations</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Locations</h2>
          <button
            form="locations-form"
            type="submit"
            disabled={isSaving}
            className="px-4 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
          >
            + Add
          </button>
        </div>

        <form
          id="locations-form"
          onSubmit={handleSubmit}
          className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs"
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border border-slate-200 rounded-md px-2 py-1"
              placeholder="e.g. Indore HQ"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="border border-slate-200 rounded-md px-2 py-1"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Country</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              className="border border-slate-200 rounded-md px-2 py-1"
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="font-medium text-slate-700">Address</label>
            <input
              name="address"
              value={form.address}
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
                    <input type="checkbox" className="accent-green-500" />
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 text-left font-semibold">City</th>
                  <th className="px-4 py-2 text-left font-semibold">Country</th>
                  <th className="px-4 py-2 text-left font-semibold">Address</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs">
                      Loading...
                    </td>
                  </tr>
                ) : !locations || locations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-xs text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  locations.map((loc) => (
                    <tr
                      key={loc._id}
                      className="odd:bg-white even:bg-slate-50/50"
                    >
                      <td className="px-4 py-2">
                        <input type="checkbox" className="accent-green-500" />
                      </td>
                      <td className="px-4 py-2 text-slate-800">
                        {loc.name}
                      </td>
                      <td className="px-4 py-2 text-slate-500">
                        {loc.city || "-"}
                      </td>
                      <td className="px-4 py-2 text-slate-500">
                        {loc.country || "-"}
                      </td>
                      <td className="px-4 py-2 text-slate-500">
                        {loc.address || "-"}
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
