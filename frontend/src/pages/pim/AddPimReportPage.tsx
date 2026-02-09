// frontend/src/pages/pim/AddPimReportPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import {
  useCreatePimReportMutation,
  PimReportDisplayGroup,
} from "../../features/pim/pimReportsApi";
import { FiTrash2 } from "react-icons/fi";

const tabBase =
  "px-5 py-2 text-xs md:text-sm rounded-full transition-colors whitespace-nowrap";

const SELECTION_CRITERIA_OPTIONS = [
  { value: "job_title", label: "Job Title" },
  { value: "sub_unit", label: "Sub Unit" },
  { value: "location", label: "Location" },
];

const INCLUDE_OPTIONS = [
  { value: "CURRENT_ONLY", label: "Current Employees Only" },
  { value: "CURRENT_AND_PAST", label: "Current and Past Employees" },
];

const DISPLAY_GROUPS = [
  {
    value: "personal",
    label: "Personal",
    fields: [
      { value: "employeeId", label: "Employee Id" },
      { value: "lastName", label: "Employee Last Name" },
      { value: "firstName", label: "Employee First Name" },
      { value: "middleName", label: "Employee Middle Name" },
      { value: "dateOfBirth", label: "Date of Birth" },
      { value: "nationality", label: "Nationality" },
      { value: "gender", label: "Gender" },
      { value: "maritalStatus", label: "Marital Status" },
      { value: "driversLicenseNumber", label: "Driver's License Number" },
      { value: "licenseExpiryDate", label: "License Expiry Date" },
      { value: "otherId", label: "Other Id" },
    ],
  },
];

type IncludeFilter = "CURRENT_ONLY" | "CURRENT_AND_PAST";

interface DisplayGroupState extends PimReportDisplayGroup {
  groupLabel: string;
}

export default function AddPimReportPage() {
  const navigate = useNavigate();

  const [createReport, { isLoading: isSaving }] =
    useCreatePimReportMutation();

  const [name, setName] = useState("");
  const [include, setInclude] = useState<IncludeFilter>("CURRENT_ONLY");

  const [selectedCriteria, setSelectedCriteria] = useState("");
  const [criteriaList, setCriteriaList] = useState<string[]>([]);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [displayGroups, setDisplayGroups] = useState<DisplayGroupState[]>([]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);

  const handleAddCriteria = () => {
    if (!selectedCriteria) return;
    if (criteriaList.includes(selectedCriteria)) return;
    setCriteriaList((prev) => [...prev, selectedCriteria]);
  };

  const handleRemoveCriteria = (value: string) => {
    setCriteriaList((prev) => prev.filter((v) => v !== value));
  };

  const handleAddDisplayField = () => {
    if (!selectedGroup || !selectedField) return;

    const groupMeta = DISPLAY_GROUPS.find((g) => g.value === selectedGroup);
    if (!groupMeta) return;

    setDisplayGroups((prev) => {
      const existing = prev.find((g) => g.groupKey === selectedGroup);
      if (existing) {
        if (existing.fields.includes(selectedField)) return prev;
        return prev.map((g) =>
          g.groupKey === selectedGroup
            ? { ...g, fields: [...g.fields, selectedField] }
            : g
        );
      }
      const newGroup: DisplayGroupState = {
        groupKey: selectedGroup,
        groupLabel: groupMeta.label,
        includeHeader: false,
        fields: [selectedField],
      };
      return [...prev, newGroup];
    });
  };

  const handleRemoveDisplayField = (groupKey: string, field: string) => {
    setDisplayGroups((prev) =>
      prev
        .map((g) =>
          g.groupKey === groupKey
            ? { ...g, fields: g.fields.filter((f) => f !== field) }
            : g
        )
        .filter((g) => g.fields.length > 0)
    );
  };

  const toggleIncludeHeader = (groupKey: string) => {
    setDisplayGroups((prev) =>
      prev.map((g) =>
        g.groupKey === groupKey
          ? { ...g, includeHeader: !g.includeHeader }
          : g
      )
    );
  };

  const getFieldLabel = (fieldValue: string) => {
    for (const g of DISPLAY_GROUPS) {
      const f = g.fields.find((fld) => fld.value === fieldValue);
      if (f) return f.label;
    }
    return fieldValue;
  };

  const handleSave = async () => {
    setErrorMsg(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg("Report name is required.");
      return;
    }

    try {
      await createReport({
        name: trimmed,
        include,
        selectionCriteria: criteriaList,
        displayGroups: displayGroups.map(
          ({ groupKey, includeHeader, fields }) => ({
            groupKey,
            includeHeader,
            fields,
          })
        ),
      }).unwrap();

      navigate("/pim/reports");
    } catch (err: any) {
      console.error("Create report failed", err);
      setErrorMsg(
        err?.data?.message || "Failed to save report. Please try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f5fb]">

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 px-8 py-6 space-y-6">
          {/* PIM heading + tabs (exact same as PimReportsPage, Reports active) */}
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
                      ? "bg-green-100 text-green-600 border border-green-200"
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
                      className="w-full text-left px-4 py-2 hover:bg-green-50"
                    >
                      Optional Fields
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfigOpen(false);
                        navigate("/pim/config/custom-fields");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-green-50"
                    >
                      Custom Fields
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfigOpen(false);
                        navigate("/pim/config/data-import");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-green-50"
                    >
                      Data Import
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfigOpen(false);
                        navigate("/pim/config/reporting-methods");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-green-50"
                    >
                      Reporting Methods
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfigOpen(false);
                        navigate("/pim/config/termination-reasons");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-green-50 rounded-b-xl"
                    >
                      Termination Reasons
                    </button>
                  </div>
                )}
              </div>

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

              {/* Reports (active) */}
              <button
                type="button"
                className={`${tabBase} bg-green-500 text-white shadow-sm`}
                onClick={() => navigate("/pim/reports")}
              >
                Reports
              </button>
            </div>
          </div>

          {/* Card */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 px-8 py-6 space-y-6">
            {/* Title */}
            <h2 className="text-sm md:text-base font-semibold text-slate-800">
              Add Report
            </h2>

            {/* Report Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">
                Report Name<span className="text-green-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Type here ..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full max-w-xl rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <hr className="border-slate-100" />

            {/* Selection Criteria */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-700">
                Selection Criteria
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
                {/* Selection Criteria dropdown + + button */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500">
                    Selection Criteria
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <select
                        value={selectedCriteria}
                        onChange={(e) =>
                          setSelectedCriteria(e.target.value || "")
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none pr-8"
                      >
                        <option value="">-- Select --</option>
                        {SELECTION_CRITERIA_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-400">
                        ▾
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCriteria}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 text-lg hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>

                  {/* chips for criteria */}
                  {criteriaList.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                      {criteriaList.map((value) => {
                        const label =
                          SELECTION_CRITERIA_OPTIONS.find(
                            (o) => o.value === value
                          )?.label || value;
                        return (
                          <span
                            key={value}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1"
                          >
                            {label}
                            <button
                              type="button"
                              className="text-slate-400"
                              onClick={() => handleRemoveCriteria(value)}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Include */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500">
                    Include
                  </label>
                  <div className="relative max-w-xs">
                    <select
                      value={include}
                      onChange={(e) =>
                        setInclude(e.target.value as IncludeFilter)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none pr-8"
                    >
                      {INCLUDE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-400">
                      ▾
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Display Fields */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-700">
                Display Fields
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
                {/* Display field group */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500">
                    Select Display Field Group
                  </label>
                  <div className="relative">
                    <select
                      value={selectedGroup}
                      onChange={(e) => {
                        setSelectedGroup(e.target.value);
                        setSelectedField("");
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none pr-8"
                    >
                      <option value="">-- Select --</option>
                      {DISPLAY_GROUPS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-400">
                      ▾
                    </span>
                  </div>
                </div>

                {/* Display field */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500">
                    Select Display Field
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <select
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none pr-8"
                      >
                        <option value="">-- Select --</option>
                        {DISPLAY_GROUPS.find(
                          (g) => g.value === selectedGroup
                        )?.fields.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-400">
                        ▾
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddDisplayField}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 text-lg hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Groups with chips */}
              <div className="mt-4 space-y-4 max-w-4xl">
                {displayGroups.map((group) => (
                  <div
                    key={group.groupKey}
                    className="grid grid-cols-[56px_120px_1fr_auto] gap-4 items-start text-xs"
                  >
                    {/* Trash icon column */}
                    <div className="flex justify-center pt-1">
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 bg-white"
                        // remove whole group when clicked
                        onClick={() =>
                          setDisplayGroups((prev) =>
                            prev.filter((g) => g.groupKey !== group.groupKey)
                          )
                        }
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>

                    {/* Group name */}
                    <div className="pt-2 text-slate-700 font-medium">
                      {group.groupLabel}
                    </div>

                    {/* Chips */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {group.fields.map((field) => (
                        <span
                          key={field}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1"
                        >
                          {getFieldLabel(field)}
                          <button
                            type="button"
                            className="text-slate-400"
                            onClick={() =>
                              handleRemoveDisplayField(group.groupKey, field)
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Include header toggle */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-500">
                        Include Header
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleIncludeHeader(group.groupKey)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          group.includeHeader
                            ? "bg-green-400"
                            : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            group.includeHeader
                              ? "translate-x-4"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error message */}
            {errorMsg && (
              <p className="text-xs text-green-500 mt-2">{errorMsg}</p>
            )}

            {/* Footer buttons */}
            <div className="flex justify-end items-center pt-4 border-t border-slate-100 mt-4">
              <p className="mr-auto text-[10px] text-slate-400">
                * Required
              </p>

              <button
                type="button"
                onClick={() => navigate("/pim/reports")}
                className="px-6 h-9 rounded-full border border-[#8bc34a] text-xs md:text-sm text-[#8bc34a] bg-white hover:bg-[#f5ffe8] mr-3"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-8 h-9 rounded-full bg-[#8bc34a] text-white text-xs md:text-sm font-semibold shadow-sm hover:bg-[#7cb342] disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
