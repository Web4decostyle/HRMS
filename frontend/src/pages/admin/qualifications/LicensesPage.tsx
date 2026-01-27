import { useState } from "react";
import {
  useGetLicensesQuery,
  useCreateLicenseMutation,
  useDeleteLicenseMutation,
} from "../../../features/qualifications/qualificationApiSlice";

export default function LicensesPage() {
  // ❗ FIX 1: remove null
  const { data, isLoading } = useGetLicensesQuery();
  const [createLicense] = useCreateLicenseMutation();
  const [deleteLicense] = useDeleteLicenseMutation();

  const [form, setForm] = useState({ name: "", description: "" });

  const addLicense = async () => {
    if (!form.name.trim()) return;
    await createLicense(form).unwrap();
    setForm({ name: "", description: "" });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Admin / Qualifications
      </h2>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold mb-4">Licenses</h3>

        {/* Add Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border px-3 py-2 rounded-md w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm">Description</label>
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="border px-3 py-2 rounded-md w-full mt-1"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addLicense}
              className="bg-lime-500 px-6 py-2 rounded-full text-white text-sm"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td className="p-4" colSpan={3}>
                    Loading...
                  </td>
                </tr>
              ) : !data || data.length === 0 ? (   
                <tr>
                  <td className="p-4 text-gray-400" colSpan={3}>
                    No Records Found
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item._id} className="border-t">
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.description}</td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteLicense(item._id)}
                        className="text-green-500 hover:text-green-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
