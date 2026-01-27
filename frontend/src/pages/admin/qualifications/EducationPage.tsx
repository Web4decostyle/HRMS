import { useState } from "react";
import {
  useGetEducationQuery,
  useCreateEducationMutation,
  useDeleteEducationMutation,
} from "../../../features/qualifications/qualificationApiSlice";

export default function EducationPage() {
  // ❗ FIX 1: remove null
  const { data, isLoading } = useGetEducationQuery();
  const [createEducation] = useCreateEducationMutation();
  const [deleteEducation] = useDeleteEducationMutation();

  const [level, setLevel] = useState("");

  // Safe fallback so TS never sees undefined
  const rows = data ?? [];

  const handleAdd = async () => {
    if (!level.trim()) return;
    await createEducation({ level }).unwrap();
    setLevel("");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Admin / Qualifications
      </h2>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold mb-4">Education</h3>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Level *
            </label>
            <input
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="border rounded-md px-3 py-2 mt-1 w-full"
              placeholder="e.g. Bachelor's"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-2 rounded-full text-sm"
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
                <th className="p-3 text-left">Level</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td className="p-4" colSpan={2}>
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-400" colSpan={2}>
                    No Records Found
                  </td>
                </tr>
              ) : (
                rows.map((item) => (
                  <tr key={item._id} className="border-t">
                    <td className="p-3">{item.level}</td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteEducation(item._id)}
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
