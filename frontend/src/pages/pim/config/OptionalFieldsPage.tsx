import React, { useEffect, useState } from "react";
import {
  useGetOptionalFieldsQuery,
  useUpdateOptionalFieldsMutation,
} from "../../../features/pim/pimConfigApi";
import AdminNavbar from "../../../components/admin/AdminTopNav";
import AdminSidebar from "../../../components/Sidebar";

export default function OptionalFieldsPage() {
  // Fix typing for data
 const { data, isLoading } = useGetOptionalFieldsQuery() as {
      data?: {
        success: boolean;
        data: {
          showNickname: boolean;
          showSmoker: boolean;
          showMilitaryService: boolean;
          showSSN: boolean;
          showSIN: boolean;
          showUSTaxExemptions: boolean;
        };
      };
      isLoading: boolean;
    };

  const [updateFields, { isLoading: isSaving }] =
    useUpdateOptionalFieldsMutation();

  const [fields, setFields] = useState({
    showNickname: false,
    showSmoker: false,
    showMilitaryService: false,
    showSSN: false,
    showSIN: false,
    showUSTaxExemptions: false,
  });

  useEffect(() => {
    if (data?.data) {
      setFields(data.data);
    }
  }, [data]);

  const handleChange = (key: string) => {
    setFields((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSave = async () => {
    await updateFields(fields);
    alert("Optional fields updated successfully");
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar />

      <div className="flex-1">
        <AdminNavbar />

        {/* PAGE HEADER */}
        <div className="px-6 py-4 border-b bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700">
            Configuration &gt; Optional Fields
          </h2>
        </div>

        {/* PAGE BODY */}
        <div className="p-6">
          <div className="bg-white shadow rounded-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Optional Fields
            </h3>

            {/* Toggle List */}
            <div className="space-y-4">
              <FieldToggle
                label="Show Nickname"
                checked={fields.showNickname}
                onChange={() => handleChange("showNickname")}
              />

              <FieldToggle
                label="Show Smoker"
                checked={fields.showSmoker}
                onChange={() => handleChange("showSmoker")}
              />

              <FieldToggle
                label="Show Military Service"
                checked={fields.showMilitaryService}
                onChange={() => handleChange("showMilitaryService")}
              />

              <hr className="my-4" />

              <FieldToggle
                label="Show SSN field"
                checked={fields.showSSN}
                onChange={() => handleChange("showSSN")}
              />

              <FieldToggle
                label="Show SIN field"
                checked={fields.showSIN}
                onChange={() => handleChange("showSIN")}
              />

              <FieldToggle
                label="Show US Tax Exemptions"
                checked={fields.showUSTaxExemptions}
                onChange={() => handleChange("showUSTaxExemptions")}
              />
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded shadow"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* REUSABLE TOGGLE COMPONENT */
function FieldToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between py-2">
      <span className="text-gray-700">{label}</span>

      <div
        onClick={onChange}
        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
          checked ? "bg-orange-600" : "bg-gray-300"
        }`}
      >
        <div
          className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
}
