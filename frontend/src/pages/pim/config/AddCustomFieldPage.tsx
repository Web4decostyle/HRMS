import React, { useState } from "react";
import {
  useCreateCustomFieldMutation,
} from "../../../features/pim/pimConfigApi";

import AdminTopNav from "../../../components/admin/AdminTopNav";
import AdminSidebar from "../../../components/Sidebar";
import { useNavigate } from "react-router-dom";

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
    if (tempOption.trim() === "") return;
    setDropdownOptions((prev) => [...prev, tempOption]);
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
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1">
        <AdminTopNav />

        {/* HEADER */}
        <div className="px-6 py-4 bg-white shadow-sm border-b">
          <h2 className="text-xl font-semibold text-gray-700">
            Configuration &gt; Add Custom Field
          </h2>
        </div>

        {/* PAGE BODY */}
        <div className="p-6 flex justify-center">
          <div className="bg-white shadow rounded-md p-6 w-full max-w-2xl">

            {/* Field Name */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Field Name *</label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                placeholder="Enter field name"
              />
            </div>

            {/* Screen Dropdown */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Screen *</label>
              <select
                value={screen}
                onChange={(e) => setScreen(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select Screen</option>
                <option value="personal">Personal Details</option>
                <option value="contact">Contact Details</option>
                <option value="emergency">Emergency Contacts</option>
                <option value="dependents">Dependents</option>
                <option value="immigration">Immigration</option>
              </select>
            </div>

            {/* Type Dropdown */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="text">Text Field</option>
                <option value="dropdown">Dropdown</option>
              </select>
            </div>

            {/* If dropdown → show options */}
            {type === "dropdown" && (
              <div className="mb-4">
                <label className="block mb-2 text-gray-700">
                  Dropdown Options *
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempOption}
                    onChange={(e) => setTempOption(e.target.value)}
                    className="flex-1 border px-3 py-2 rounded"
                    placeholder="Add option"
                  />
                  <button
                    onClick={handleAddOption}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Add
                  </button>
                </div>

                {/* Options List */}
                <div className="mt-3 space-y-2">
                  {dropdownOptions.map((opt, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded"
                    >
                      <span>{opt}</span>

                      <button
                        onClick={() => handleDeleteOption(i)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Toggle */}
            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={required}
                onChange={() => setRequired(!required)}
              />
              <span className="text-gray-700">Required</span>
            </label>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => navigate("/pim/config/custom-fields")}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded shadow"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
