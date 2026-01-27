// frontend/src/pages/pim/config/AddCustomFieldPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCustomFieldMutation } from "../../../features/pim/pimConfigApi";

const tabBase =
  "px-5 py-2 text-xs md:text-sm rounded-full transition-colors whitespace-nowrap";

export default function AddCustomFieldPage() {
  const navigate = useNavigate();
  const [createField, { isLoading }] = useCreateCustomFieldMutation();

  const [fieldName, setFieldName] = useState("");
  const [screen, setScreen] = useState("");
  const [type, setType] = useState<"text" | "dropdown">("text");
  const [required, setRequired] = useState(false);

  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  const [tempOption, setTempOption] = useState("");

  const handleAddOption = () => {
    if (!tempOption.trim()) return;
    setDropdownOptions((prev) => [...prev, tempOption.trim()]);
    setTempOption("");
  };

  const handleDeleteOption = (index: number) => {
    setDropdownOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!fieldName || !screen || !type) {
      alert("All required fields must be filled.");
      return;
    }

    if (type === "dropdown" && dropdownOptions.length === 0) {
      alert("Dropdown must contain at least one option.");
      return;
    }

    await createField({
      fieldName,
      screen,
      type,
      required,
      dropdownOptions,
    });

    alert("Custom field created successfully!");
    navigate("/pim/config/custom-fields");
  };

  return (
    <div className="px-8 py-6 space-y-6">
      {/* Header + tabs same as list page */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          PIM / Configuration
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`${tabBase} bg-red-500 text-white shadow-sm`}
          >
            Configuration
          </button>
          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/pim")}
          >
            Employee List
          </button>
          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/employees/add")}
          >
            Add Employee
          </button>
          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/pim/reports")}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Card */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl">
        <h2 className="text-sm md:text-base font-semibold text-slate-800 mb-4">
          Add Custom Field
        </h2>

        {/* Field Name */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 text-sm">
            Field Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Enter field name"
          />
        </div>

        {/* Screen */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 text-sm">
            Screen <span className="text-red-500">*</span>
          </label>
          <select
            value={screen}
            onChange={(e) => setScreen(e.target.value)}
            className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="">Select Screen</option>
            <option value="personal">Personal Details</option>
            <option value="contact">Contact Details</option>
            <option value="emergency">Emergency Contacts</option>
            <option value="dependents">Dependents</option>
            <option value="immigration">Immigration</option>
          </select>
        </div>

        {/* Type */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 text-sm">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="text">Text Field</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </div>

        {/* Dropdown options */}
        {type === "dropdown" && (
          <div className="mb-4">
            <label className="block mb-2 text-gray-700 text-sm">
              Dropdown Options <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={tempOption}
                onChange={(e) => setTempOption(e.target.value)}
                className="flex-1 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                placeholder="Add option"
              />
              <button
                type="button"
                onClick={handleAddOption}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                Add
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {dropdownOptions.map((opt, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm"
                >
                  <span>{opt}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteOption(i)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required */}
        <label className="flex items-center gap-2 mt-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={required}
            onChange={() => setRequired(!required)}
          />
          <span>Required</span>
        </label>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/pim/config/custom-fields")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full text-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm shadow disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </section>
    </div>
  );
}
