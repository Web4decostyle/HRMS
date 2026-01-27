import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateReportingMethodMutation } from "../../../features/pim/pimConfigApi";

const tabBase =
  "px-5 py-2 text-xs md:text-sm rounded-full transition-colors whitespace-nowrap";

export default function AddReportingMethodPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [createMethod, { isLoading }] = useCreateReportingMethodMutation();

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Name is required.");
      return;
    }

    try {
      await createMethod({ name: name.trim() }).unwrap();
      alert("Reporting method created successfully!");
      navigate("/pim/config/reporting-methods");
    } catch (err: any) {
      console.error("Create reporting method failed:", err);
      alert(err?.data?.message || "Failed to create reporting method");
    }
  };

  return (
    <div className="px-8 py-6 space-y-6">
      {/* Header + tabs */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">PIM</h1>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`${tabBase} bg-green-500 text-white shadow-sm`}
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
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-3xl">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm md:text-base font-semibold text-slate-800">
            Add Reporting Method
          </h2>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Name<span className="text-green-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-lime-500"
            />
          </div>

          <p className="text-[10px] text-slate-400">* Required</p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/pim/config/reporting-methods")}
              className="px-6 h-9 rounded-full border border-slate-300 bg-white text-xs md:text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-8 h-9 rounded-full bg-[#8bc34a] text-white text-xs md:text-sm font-semibold shadow-sm hover:bg-[#7cb342] disabled:opacity-60"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
