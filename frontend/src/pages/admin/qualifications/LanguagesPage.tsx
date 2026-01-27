import { useState } from "react";
import {
  useGetLanguagesQuery,
  useCreateLanguageMutation,
  useDeleteLanguageMutation,
} from "../../../features/qualifications/qualificationApiSlice";

export default function LanguagesPage() {
  // ❌ was: useGetLanguagesQuery(null)
  const { data, isLoading } = useGetLanguagesQuery();
  const [createLanguage] = useCreateLanguageMutation();
  const [deleteLanguage] = useDeleteLanguageMutation();

  const [form, setForm] = useState({
    name: "",
    fluency: "Writing",
    competency: "Good",
  });

  const addLanguage = async () => {
    if (!form.name.trim()) return;
    await createLanguage(form).unwrap();
    setForm({ name: "", fluency: "Writing", competency: "Good" });
  };

  // safe list so TS doesn’t complain about undefined
  const languages = data ?? [];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Admin / Qualifications
      </h2>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold mb-4">Languages</h3>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border px-3 py-2 rounded-md w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm">Fluency</label>
            <select
              value={form.fluency}
              onChange={(e) => setForm({ ...form, fluency: e.target.value })}
              className="border px-3 py-2 rounded-md w-full mt-1"
            >
              <option>Writing</option>
              <option>Speaking</option>
              <option>Reading</option>
            </select>
          </div>

          <div>
            <label className="text-sm">Competency</label>
            <select
              value={form.competency}
              onChange={(e) =>
                setForm({ ...form, competency: e.target.value })
              }
              className="border px-3 py-2 rounded-md w-full mt-1"
            >
              <option>Poor</option>
              <option>Good</option>
              <option>Excellent</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={addLanguage}
              className="bg-lime-500 px-6 py-2 rounded-full text-white text-sm"
            >
              + Add
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Fluency</th>
                <th className="p-3 text-left">Competency</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td className="p-4" colSpan={4}>
                    Loading...
                  </td>
                </tr>
              ) : languages.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-400" colSpan={4}>
                    No Records Found
                  </td>
                </tr>
              ) : (
                languages.map((item) => (
                  <tr key={item._id} className="border-t">
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.fluency}</td>
                    <td className="p-3">{item.competency}</td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteLanguage(item._id)}
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
