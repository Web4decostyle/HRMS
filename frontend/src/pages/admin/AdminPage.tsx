// frontend/src/pages/admin/AdminPage.tsx
import { FormEvent, useState } from "react";
import {
  useGetOrgUnitsQuery,
  useCreateOrgUnitMutation,
  useGetJobTitlesQuery,
  useCreateJobTitleMutation,
  useGetPayGradesQuery,
  useCreatePayGradeMutation,
  useGetLocationsQuery,
  useCreateLocationMutation,
} from "../../features/admin/adminApi";


type AdminTabKey =
  | "user-management"
  | "job"
  | "organization"
  | "qualifications"
  | "nationalities"
  | "branding"
  | "configuration";

const TABS: { key: AdminTabKey; label: string }[] = [
  { key: "user-management", label: "User Management" },
  { key: "job", label: "Job" },
  { key: "organization", label: "Organization" },
  { key: "qualifications", label: "Qualifications" },
  { key: "nationalities", label: "Nationalities" },
  { key: "branding", label: "Corporate Branding" },
  { key: "configuration", label: "Configuration" },
];

export default function AdminPage() {
  // Queries
  const { data: orgUnits } = useGetOrgUnitsQuery();
  const { data: jobTitles } = useGetJobTitlesQuery();
  const { data: payGrades } = useGetPayGradesQuery();
  const { data: locations } = useGetLocationsQuery();

  // Mutations
  const [createOrgUnit] = useCreateOrgUnitMutation();
  const [createJobTitle] = useCreateJobTitleMutation();
  const [createPayGrade] = useCreatePayGradeMutation();
  const [createLocation] = useCreateLocationMutation();

  // Simple form state (just "name" for now)
  const [orgName, setOrgName] = useState("");
  const [jobName, setJobName] = useState("");
  const [payName, setPayName] = useState("");
  const [locName, setLocName] = useState("");

  // Which top tab is active – default to Job (like in your screenshot)
  const [activeTab, setActiveTab] = useState<AdminTabKey>("job");

  async function handleOrgSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) return;
    await createOrgUnit({ name: orgName.trim() }).unwrap();
    setOrgName("");
  }

  async function handleJobSubmit(e: FormEvent) {
    e.preventDefault();
    if (!jobName.trim()) return;
    await createJobTitle({ name: jobName.trim() }).unwrap();
    setJobName("");
  }

  async function handlePaySubmit(e: FormEvent) {
    e.preventDefault();
    if (!payName.trim()) return;
    await createPayGrade({ name: payName.trim() }).unwrap();
    setPayName("");
  }

  async function handleLocSubmit(e: FormEvent) {
    e.preventDefault();
    if (!locName.trim()) return;
    await createLocation({ name: locName.trim() }).unwrap();
    setLocName("");
  }

  return (
    <div className="h-full bg-[#f5f6fa] px-6 py-4 overflow-y-auto">
      {/* Page header (title + breadcrumb style subtitle) */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-slate-900">Admin</h1>
        <p className="text-[12px] text-slate-500 mt-1">
          Configure your organization structure, jobs, pay grades and locations.
        </p>
      </div>

      {/* Top tabs */}
      <div className="flex items-center gap-2 mb-5">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                "px-4 py-2 text-[11px] font-semibold rounded-sm border transition-colors",
                isActive
                  ? "bg-[#f7941d] text-white border-[#f7941d]"
                  : "bg-white text-slate-700 border-[#e0e0e0] hover:bg-[#fff5eb] hover:text-[#f7941d]",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content area – card grid, changes based on selected tab */}
      {activeTab === "job" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Job Titles */}
          <section className="bg-white rounded-md border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Job Titles
              </h2>
            </div>

            <form
              onSubmit={handleJobSubmit}
              className="flex gap-2 mb-3 text-sm"
            >
              <input
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="Add new job title..."
                className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-md text-xs bg-red-500 text-white hover:bg-red-600"
              >
                Add
              </button>
            </form>

            <ul className="text-xs text-slate-700 space-y-1 max-h-56 overflow-auto">
              {jobTitles?.map((j) => (
                <li
                  key={j._id}
                  className="flex justify-between items-center border-b last:border-b-0 border-slate-100 py-1"
                >
                  <span>{j.name}</span>
                  {j.code && (
                    <span className="text-[10px] text-slate-400">
                      {j.code}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Pay Grades */}
          <section className="bg-white rounded-md border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Pay Grades
              </h2>
            </div>

            <form
              onSubmit={handlePaySubmit}
              className="flex gap-2 mb-3 text-sm"
            >
              <input
                value={payName}
                onChange={(e) => setPayName(e.target.value)}
                placeholder="Add pay grade..."
                className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-md text-xs bg-red-500 text-white hover:bg-red-600"
              >
                Add
              </button>
            </form>

            <ul className="text-xs text-slate-700 space-y-1 max-h-56 overflow-auto">
              {payGrades?.map((p) => (
                <li key={p._id} className="flex justify-between items-center">
                  <span>{p.name}</span>
                  {p.minSalary && p.maxSalary && (
                    <span className="text-[10px] text-slate-400">
                      ({p.currency ?? "INR"} {p.minSalary}–{p.maxSalary})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {activeTab === "organization" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Org Units / Sub Units */}
          <section className="bg-white rounded-md border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Organization Units
              </h2>
            </div>

            <form
              onSubmit={handleOrgSubmit}
              className="flex gap-2 mb-3 text-sm"
            >
              <input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Add new unit / department..."
                className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-md text-xs bg-red-500 text-white hover:bg-red-600"
              >
                Add
              </button>
            </form>

            <ul className="text-xs text-slate-700 space-y-1 max-h-56 overflow-auto">
              {orgUnits?.map((u) => (
                <li
                  key={u._id}
                  className="flex justify-between items-center border-b last:border-b-0 border-slate-100 py-1"
                >
                  <span>{u.name}</span>
                  {u.code && (
                    <span className="text-[10px] text-slate-400">
                      {u.code}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Locations */}
          <section className="bg-white rounded-md border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Locations
              </h2>
            </div>

            <form
              onSubmit={handleLocSubmit}
              className="flex gap-2 mb-3 text-sm"
            >
              <input
                value={locName}
                onChange={(e) => setLocName(e.target.value)}
                placeholder="Add location (e.g. Indore HQ)..."
                className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-md text-xs bg-red-500 text-white hover:bg-red-600"
              >
                Add
              </button>
            </form>

            <ul className="text-xs text-slate-700 space-y-1 max-h-56 overflow-auto">
              {locations?.map((l) => (
                <li key={l._id} className="flex justify-between items-center">
                  <span>{l.name}</span>
                  {l.city && (
                    <span className="text-[10px] text-slate-400">
                      {" "}
                      · {l.city}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {activeTab !== "job" && activeTab !== "organization" && (
        <div className="mt-8 text-[12px] text-slate-500">
          <p className="mb-1 font-semibold text-slate-700">
            {TABS.find((t) => t.key === activeTab)?.label}
          </p>
          <p>
            This section is ready for you — once we decide the exact fields
            (like skills, education levels, nationalities, etc.) we can plug
            them in here, similar to Job and Organization.
          </p>
        </div>
      )}
    </div>
  );
}
