import React from "react";
import {
  useGetCustomFieldsQuery,
  useDeleteCustomFieldMutation,
} from "../../../features/pim/pimConfigApi";

import AdminNavbar from "../../../components/admin/AdminTopNav";
import AdminSidebar from "../../../components/Sidebar";
import { Link } from "react-router-dom";

export default function CustomFieldsListPage() {
  const { data, isLoading } = useGetCustomFieldsQuery();
  const [deleteField] = useDeleteCustomFieldMutation();

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this field?")) return;
    await deleteField(id);
  };

  const fields = data?.data || [];
  const used = fields.length;
  const remaining = 10 - used;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar />

      <div className="flex-1">
        <AdminNavbar />

        {/* PAGE HEADER */}
        <div className="px-6 py-4 border-b bg-white shadow-sm flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Configuration &gt; Custom Fields
          </h2>

          <Link
            to="/pim/config/custom-fields/add"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded"
          >
            Add
          </Link>
        </div>

        {/* PAGE BODY */}
        <div className="p-6">
          <div className="bg-white shadow rounded-md p-6">

            <p className="mb-4 text-gray-600">
              {remaining} custom fields left
            </p>

            {isLoading ? (
              <div>Loading...</div>
            ) : fields.length === 0 ? (
              <div className="text-gray-500">No custom fields found.</div>
            ) : (
              <table className="w-full border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Field Name</th>
                    <th className="p-2 border">Screen</th>
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Required</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {fields.map((field: any) => (
                    <tr key={field._id} className="text-center">
                      <td className="p-2 border">{field.fieldName}</td>
                      <td className="p-2 border capitalize">{field.screen}</td>
                      <td className="p-2 border capitalize">{field.type}</td>
                      <td className="p-2 border">
                        {field.required ? "Yes" : "No"}
                      </td>
                      <td className="p-2 border">
                        <button
                          onClick={() => handleDelete(field._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
