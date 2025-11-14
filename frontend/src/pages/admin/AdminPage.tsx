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

export default function AdminPage() {
  const { data: orgUnits } = useGetOrgUnitsQuery();
  const { data: jobTitles } = useGetJobTitlesQuery();
  const { data: payGrades } = useGetPayGradesQuery();
  const { data: locations } = useGetLocationsQuery();

  const [createOrgUnit] = useCreateOrgUnitMutation();
  const [createJobTitle] = useCreateJobTitleMutation();
  const [createPayGrade] = useCreatePayGradeMutation();
  const [createLocation] = useCreateLocationMutation();

  const [orgName, setOrgName] = useState("");
  const [jobName, setJobName] = useState("");
  const [payName, setPayName] = useState("");
  const [locName, setLocName] = useState("");

  async function handleOrgSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) return;
    await createOrgUnit({ name: orgName }).unwrap();
    setOrgName("");
  }

  async function handleJobSubmit(e: FormEvent) {
    e.preventDefault();
    if (!jobName.trim()) return;
    await createJobTitle({ name: jobName }).unwrap();
    setJobName("");
  }

  async function handlePaySubmit(e: FormEvent) {
    e.preventDefault();
    if (!payName.trim()) return;
    await createPayGrade({ name: payName }).unwrap();
    setPayName("");
  }

  async function handleLocSubmit(e: FormEvent) {
    e.preventDefault();
    if (!locName.trim()) return;
    await createLocation({ name: locName }).unwrap();
    setLocName("");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">
        Admin · Organization & Job Setup
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Org Units */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
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
              placeholder="Add new unit..."
              className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-md text-xs bg-green-500 text-white hover:bg-green-600"
            >
              Add
            </button>
          </form>
          <ul className="text-xs text-slate-700 space-y-1 max-h-52 overflow-auto">
            {orgUnits?.map((u) => (
              <li key={u._id} className="flex justify-between">
                <span>{u.name}</span>
                {u.code && (
                  <span className="text-[10px] text-slate-400">{u.code}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Job Titles */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
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
              className="px-3 py-1 rounded-md text-xs bg-green-500 text-white hover:bg-green-600"
            >
              Add
            </button>
          </form>
          <ul className="text-xs text-slate-700 space-y-1 max-h-52 overflow-auto">
            {jobTitles?.map((j) => (
              <li key={j._id}>{j.name}</li>
            ))}
          </ul>
        </section>

        {/* Pay Grades */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
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
              className="px-3 py-1 rounded-md text-xs bg-green-500 text-white hover:bg-green-600"
            >
              Add
            </button>
          </form>
          <ul className="text-xs text-slate-700 space-y-1 max-h-52 overflow-auto">
            {payGrades?.map((p) => (
              <li key={p._id}>
                {p.name}{" "}
                {p.minSalary && p.maxSalary && (
                  <span className="text-[10px] text-slate-400">
                    ({p.currency ?? "INR"} {p.minSalary}–{p.maxSalary})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Locations */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
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
              placeholder="Add new location..."
              className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-md text-xs bg-green-500 text-white hover:bg-green-600"
            >
              Add
            </button>
          </form>
          <ul className="text-xs text-slate-700 space-y-1 max-h-52 overflow-auto">
            {locations?.map((l) => (
              <li key={l._id}>
                {l.name}
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
    </div>
  );
}
