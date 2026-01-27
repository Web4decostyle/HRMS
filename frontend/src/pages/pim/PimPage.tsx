// frontend/src/pages/pim/EmployeesPage.tsx
import { FormEvent, useState } from "react";
import {
  useGetEmployeesQuery,
  Employee,
  EmployeeFilters,
} from "../../features/employees/employeesApi";
import { useNavigate } from "react-router-dom";

type IncludeFilter = "current" | "past" | "all";

interface SearchFormState {
  name: string;
  employeeId: string;
  jobTitle: string;
  subUnit: string;
  status: "" | "ACTIVE" | "INACTIVE";
  include: IncludeFilter;
  supervisor: string; // placeholder (no field yet in model)
}

const defaultSearchForm: SearchFormState = {
  name: "",
  employeeId: "",
  jobTitle: "",
  subUnit: "",
  status: "",
  include: "current",
  supervisor: "",
};

export default function EmployeesPage() {
  const [filters, setFilters] = useState<EmployeeFilters | void>({
    include: "current",
  });

  const [searchForm, setSearchForm] = useState<SearchFormState>(
    defaultSearchForm
  );

  const navigate = useNavigate();
  const {
    data: employees = [],
    isLoading,
    isError,
  } = useGetEmployeesQuery(filters);

  // config dropdown open/close
  const [configOpen, setConfigOpen] = useState(false);

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setSearchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();

    const nextFilters: EmployeeFilters = {};

    if (searchForm.name.trim()) nextFilters.name = searchForm.name.trim();
    if (searchForm.employeeId.trim())
      nextFilters.employeeId = searchForm.employeeId.trim();
    if (searchForm.jobTitle.trim())
      nextFilters.jobTitle = searchForm.jobTitle.trim();
    if (searchForm.subUnit.trim())
      nextFilters.subUnit = searchForm.subUnit.trim();
    if (searchForm.status) nextFilters.status = searchForm.status;
    if (searchForm.include) nextFilters.include = searchForm.include;

    setFilters(nextFilters);
  }

  function handleReset() {
    setSearchForm(defaultSearchForm);
    setFilters({ include: "current" });
  }

  const tabBase =
    "px-5 py-2 text-xs md:text-sm rounded-full transition-colors whitespace-nowrap";

  return (
    <div className="space-y-5">
      {/* Page title + top tabs (PIM) */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">PIM</h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Configuration + dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setConfigOpen((open) => !open)}
              className={`${tabBase} ${
                configOpen
                  ? "bg-red-100 text-red-600 border border-red-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>Configuration</span>
              <span className="ml-1 text-[10px] align-middle">▾</span>
            </button>

            {configOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-100 text-xs text-slate-600 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/optional-fields");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50"
                >
                  Optional Fields
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/custom-fields");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50"
                >
                  Custom Fields
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/data-import");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50"
                >
                  Data Import
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/reporting-methods");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50"
                >
                  Reporting Methods
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/termination-reasons");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 rounded-b-xl"
                >
                  Termination Reasons
                </button>
              </div>
            )}
          </div>

          {/* Employee List (active tab) */}
          <button
            type="button"
            className={`${tabBase} bg-red-500 text-white shadow-sm`}
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

      {/* Search Card (Employee Information) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          Employee Information
        </h2>

        <form onSubmit={handleSearch} className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Employee Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Employee Name
              </label>
              <input
                type="text"
                name="name"
                value={searchForm.name}
                onChange={handleFieldChange}
                placeholder="Type for hints..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Employee Id */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Employee Id
              </label>
              <input
                type="text"
                name="employeeId"
                value={searchForm.employeeId}
                onChange={handleFieldChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Employment Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Employment Status
              </label>
              <select
                name="status"
                value={searchForm.status}
                onChange={handleFieldChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">-- Select --</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Include */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Include
              </label>
              <select
                name="include"
                value={searchForm.include}
                onChange={handleFieldChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              >
                <option value="current">Current Employees Only</option>
                <option value="past">Past Employees Only</option>
                <option value="all">All Employees</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Supervisor Name – placeholder for future supervisor relation */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Supervisor Name
              </label>
              <input
                type="text"
                name="supervisor"
                value={searchForm.supervisor}
                onChange={handleFieldChange}
                disabled
                placeholder="(Not linked to data yet)"
                className="w-full rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm bg-slate-50 text-slate-400"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Job Title
              </label>
              <input
                type="text"
                name="jobTitle"
                value={searchForm.jobTitle}
                onChange={handleFieldChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Sub Unit (maps to department) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Sub Unit
              </label>
              <input
                type="text"
                name="subUnit"
                value={searchForm.subUnit}
                onChange={handleFieldChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-full border border-slate-300 text-xs md:text-sm text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-lime-500 text-xs md:text-sm text-white font-semibold shadow-sm hover:bg-lime-600"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Results card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        {/* Header with Add button + record count */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 rounded-full bg-lime-500 text-white text-xs md:text-sm font-semibold hover:bg-lime-600"
            onClick={() => {
              navigate("/employees/add");
            }}
          >
            + Add
          </button>

          <p className="text-[11px] text-slate-500">
            ({employees.length} Record{employees.length === 1 ? "" : "s"} Found)
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Id</th>
                <th className="px-6 py-3 text-left">
                  First (&amp; Middle) Name
                </th>
                <th className="px-6 py-3 text-left">Last Name</th>
                <th className="px-6 py-3 text-left">Job Title</th>
                <th className="px-6 py-3 text-left">Employment Status</th>
                <th className="px-6 py-3 text-left">Sub Unit</th>
                <th className="px-6 py-3 text-left">Supervisor</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-slate-400 text-sm"
                  >
                    Loading employees…
                  </td>
                </tr>
              )}

              {isError && !isLoading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-red-500 text-sm"
                  >
                    Failed to load employees. Please try again.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && employees.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-slate-400 text-sm"
                  >
                    No employees found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                employees.map((emp: Employee) => (
                  <tr
                    key={emp._id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-3 text-slate-700">
                      {emp.employeeId}
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {emp.firstName}
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {emp.lastName}
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {emp.jobTitle || "-"}
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {emp.status === "ACTIVE" ? "Active" : "Inactive"}
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {emp.department || "-"}
                    </td>
                    <td className="px-6 py-3 text-slate-700">-</td>
                    <td className="px-6 py-3 text-center text-xs text-red-600">
                      <button className="px-3 py-1 rounded-full border border-red-200 bg-red-50 hover:bg-red-100"
                        onClick={() => navigate(`/pim/employee/${emp._id}`)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
