// frontend/src/pages/pim/config/CustomFieldsListPage.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetCustomFieldsQuery,
  useDeleteCustomFieldMutation,
} from "../../../features/pim/pimConfigApi";
import { Trash2, Pencil } from "lucide-react";

const SCREEN_LABELS: Record<string, string> = {
  personal: "Personal Details",
  contact: "Contact Details",
  emergency: "Emergency Contacts",
  dependents: "Dependents",
  immigration: "Immigration",
  job: "Job",
  salary: "Salary",
  report_to: "Report To",
  qualifications: "Qualifications",
  membership: "Membership",
};

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  dropdown: "Drop Down",
};

const tabBase =
  "px-5 py-2 text-xs md:text-sm rounded-full transition-colors whitespace-nowrap";

export default function CustomFieldsListPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetCustomFieldsQuery();
  const [deleteField] = useDeleteCustomFieldMutation();

  const fields = data?.data || [];
  const used = fields.length;
  const remaining = 10 - used;

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this field?")) return;
    await deleteField(id);
  };

  return (
    <div className="px-8 py-6 space-y-6">
      {/* PIM / Configuration header + tabs (inside Layout) */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          PIM / Configuration
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Configuration (active tab) */}
          <button
            type="button"
            className={`${tabBase} bg-red-500 text-white shadow-sm`}
          >
            Configuration
          </button>

          {/* Employee List */}
          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/pim")}
          >
            Employee List
          </button>

          {/* Add Employee */}
          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/employees/add")}
          >
            Add Employee
          </button>

          {/* Reports */}
          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/pim/reports")}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Custom Fields card */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm md:text-base font-semibold text-slate-800">
            Custom Fields
          </h2>

          <div className="flex items-center gap-4">
            <p className="text-xs md:text-sm text-slate-500">
              Remaining number of custom fields:{" "}
              <span className="font-semibold text-slate-700">
                {remaining < 0 ? 0 : remaining}
              </span>
            </p>

            <Link
              to="/pim/config/custom-fields/add"
              className="inline-flex items-center px-4 py-2 rounded-full bg-lime-500 text-white text-xs md:text-sm font-semibold shadow-sm hover:bg-lime-600"
            >
              <span className="mr-1 text-base leading-none">+</span>
              <span>Add</span>
            </Link>
          </div>
        </div>

        {/* Record count row */}
        <div className="px-6 py-3 border-b border-slate-100 text-[11px] md:text-xs text-slate-500">
          ({used}) Record{used === 1 ? "" : "s"} Found
        </div>

        {/* Table / states */}
        {isLoading ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">
            Loading custom fields…
          </div>
        ) : fields.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">
            No custom fields found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f8fafc] text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      readOnly
                    />
                  </th>
                  <th className="px-2 py-3 text-left whitespace-nowrap">
                    Custom Field Name
                  </th>
                  <th className="px-2 py-3 text-left whitespace-nowrap">
                    Screen
                  </th>
                  <th className="px-2 py-3 text-left whitespace-nowrap">
                    Field Type
                  </th>
                  <th className="px-6 py-3 text-center whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="text-slate-700">
                {fields.map((field: any, index: number) => {
                  const screenLabel =
                    SCREEN_LABELS[field.screen] || field.screen;
                  const typeLabel =
                    FIELD_TYPE_LABELS[field.type] || field.type;

                  return (
                    <tr
                      key={field._id}
                      className={`border-t border-slate-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-[#fafbff]"
                      } hover:bg-slate-50 transition-colors`}
                    >
                      <td className="px-6 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                          readOnly
                        />
                      </td>

                      <td className="px-2 py-3 text-sm">
                        {field.fieldName}
                      </td>

                      <td className="px-2 py-3 text-sm">{screenLabel}</td>

                      <td className="px-2 py-3 text-sm">{typeLabel}</td>

                      <td className="px-6 py-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
                            disabled
                            title="Edit (not implemented yet)"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(field._id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
